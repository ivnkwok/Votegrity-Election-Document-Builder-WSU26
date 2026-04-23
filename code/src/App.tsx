import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useAppController } from "./hooks/useAppController";
import { Canvas } from "./components/Canvas/Canvas";
import { AppSidebar } from "./components/Sidebar/AppSidebar";
import { HelpDialog } from "./components/HelpDialog";
import { TOOL_DEFINITIONS } from "./config/tools";
import { TEMPLATE_OPTIONS, loadTemplateLayout, type TemplateId } from "./services/templateService";
import allElections from "./data/AllElection.json";
import voterSampleCanonical from "./data/voterMailMergeSampleCanonical.json";
import voterSampleColumnsRows from "./data/voterMailMergeSampleColumnsRows.json";
import type { ElectionRecord } from "./utils/parseElectionData";

const electionRecords = allElections as ElectionRecord[];

const availableElectionRecords = electionRecords.filter(
  (record) => Array.isArray(record.questions) && record.questions.length > 0
);

const defaultElection = availableElectionRecords.find((record) => !record.is_archived)
  ?? availableElectionRecords[0];

const ELECTION_OPTIONS: Array<{ value: string; label: string }> = availableElectionRecords.map(
  (record) => ({
    value: record.uuid,
    label: record.short_name?.trim() || record.name,
  })
);

const voterDataSets = {
  "sample-canonical": voterSampleCanonical,
  "sample-columns": voterSampleColumnsRows,
} as const;

type VoterListKey = keyof typeof voterDataSets | "upload";

const VOTER_LIST_OPTIONS: Array<{ value: VoterListKey; label: string }> = [
  // { value: "sample-canonical", label: "Sample Voters (Canonical)" },
  // { value: "sample-columns", label: "Sample Voters (Columns/Rows)" },
  { value: "upload", label: "Upload JSON File" },
];

function getVoterListLabel(value: VoterListKey): string {
  return VOTER_LIST_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export default function App() {
  const [selectedElection, setSelectedElection] = useState<string>(defaultElection?.uuid ?? "");
  const [selectedVoterList, setSelectedVoterList] = useState<VoterListKey>("upload");
  const [uploadedVoterData, setUploadedVoterData] = useState<unknown | null>(null);
  const [uploadedVoterFileName, setUploadedVoterFileName] = useState<string | null>(null);

  const selectedElectionRecord = useMemo(
    () =>
      availableElectionRecords.find((record) => record.uuid === selectedElection)
      ?? defaultElection
      ?? null,
    [selectedElection]
  );

  const selectedElectionData = useMemo(
    () => selectedElectionRecord?.questions ?? [],
    [selectedElectionRecord]
  );

  const {
    canvasItems,
    selectedId,
    selectedIds,
    dragSession,
    editingItemId,
    selectOne,
    toggleSelect,
    clearSelection,
    setEditingItemId,
    handleLoadFile,
    handlePreviewPDF,
    handleMailMergePDF,
    handleDragStart,
    handleDragMove,
    handleDragCancel,
    handleDragEnd,
    handlePdfImport,
    save,
    updateItem,
    pageOrder,
    activePageId,
    pageNamesById,
    switchPage,
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
    movePage,
    loadDocument,
    deleteSelectedItems,
    isMailMerging,
    toolStatusMessage,
  } = useAppController({ electionData: selectedElectionData });

  const selectedItem = useMemo(
    () => canvasItems.find((item) => item.id === selectedId),
    [canvasItems, selectedId]
  );
  const activeTool = useMemo(
    () => TOOL_DEFINITIONS.find((tool) => tool.id === dragSession.activeId) ?? null,
    [dragSession.activeId]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const selectedVoterData = useMemo(() => {
    if (selectedVoterList === "upload") {
      return uploadedVoterData;
    }

    return voterDataSets[selectedVoterList];
  }, [selectedVoterList, uploadedVoterData]);

  const canRunMailMerge = selectedVoterList !== "upload" || uploadedVoterData !== null;

  const handleVoterListUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      setUploadedVoterData(parsed);
      setUploadedVoterFileName(file.name);
      setSelectedVoterList("upload");
    } catch (err) {
      if (!(err instanceof SyntaxError)) {
        console.error(err);
      }
      setUploadedVoterData(null);
      setUploadedVoterFileName(null);
      alert("Could not parse voter list JSON file.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <DragOverlay dropAnimation={null}>
        {activeTool ? (
          <div className="pointer-events-none min-w-40 rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-900 shadow-2xl">
            {activeTool.label}
          </div>
        ) : null}
      </DragOverlay>

      <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-gray-300 bg-slate-200 px-6 shadow-sm">
          <h1 className="text-xl font-semibold">Votegrity Election Document Builder</h1>
          <HelpDialog />
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <AppSidebar
            tools={TOOL_DEFINITIONS}
            electionOptions={ELECTION_OPTIONS}
            templateOptions={TEMPLATE_OPTIONS}
            selectedElection={selectedElection}
            onSelectedElectionChange={setSelectedElection}
            onTemplateChange={(value) => {
              try {
                const doc = loadTemplateLayout(value as TemplateId);
                loadDocument(doc);
              } catch (err) {
                console.error(err);
                const message = err instanceof Error ? err.message : "Error loading template.";
                alert(message);
              }
            }}
            pageOrder={pageOrder}
            activePageId={activePageId}
            pageNamesById={pageNamesById}
            switchPage={switchPage}
            addPage={addPage}
            duplicatePage={duplicatePage}
            deletePage={deletePage}
            renamePage={renamePage}
            movePage={movePage}
            onPdfPagesExtracted={handlePdfImport}
            onSave={save}
            onLoad={handleLoadFile}
            onPreview={() => {
              clearSelection();
              setEditingItemId(null);
              requestAnimationFrame(() => {
                void handlePreviewPDF();
              });
            }}
            voterListOptions={VOTER_LIST_OPTIONS}
            selectedVoterList={selectedVoterList}
            uploadedVoterListName={selectedVoterList === "upload" ? uploadedVoterFileName : null}
            canRunMailMerge={canRunMailMerge}
            isMailMerging={isMailMerging}
            toolStatusMessage={toolStatusMessage}
            onSelectedVoterListChange={(value) => setSelectedVoterList(value as VoterListKey)}
            onUploadVoterList={handleVoterListUpload}
            onRunMailMerge={() => {
              if (!selectedVoterData) {
                alert("Please upload a voter list JSON file before running mail merge.");
                return;
              }

              clearSelection();
              setEditingItemId(null);
              requestAnimationFrame(() => {
                void handleMailMergePDF(selectedVoterData, {
                  sourceLabel: getVoterListLabel(selectedVoterList),
                });
              });
            }}
            selectedItem={selectedItem}
            onChangeItem={updateItem}
            onDeleteItem={deleteSelectedItems}
          />

          <div className="min-w-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain bg-gray-100 px-6 pt-10 pb-10">
            <Canvas
              canvasItems={canvasItems}
              selectedId={selectedId}
              selectedIds={selectedIds}
              dragSession={dragSession}
              editingItemId={editingItemId}
              onSelect={(id, e) => {
                if (e.shiftKey || e.metaKey || e.ctrlKey) {
                  toggleSelect(id);
                } else {
                  selectOne(id);
                }

                if (editingItemId && editingItemId !== id) {
                  setEditingItemId(null);
                }
              }}
              onClearSelection={() => {
                clearSelection();
                setEditingItemId(null);
              }}
              onBeginEdit={(id) => {
                selectOne(id);
                setEditingItemId(id);
              }}
              onExitEdit={() => setEditingItemId(null)}
              onChangeItem={updateItem}
            />
          </div>
        </div>
      </div>
    </DndContext>
  );
}
