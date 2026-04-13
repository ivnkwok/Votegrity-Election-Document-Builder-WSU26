import { DndContext } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import { useAppController } from "./hooks/useAppController";
import { Canvas } from "./components/Canvas/Canvas";
import { AppSidebar } from "./components/Sidebar/AppSidebar";
import { TOOL_DEFINITIONS } from "./config/tools";
import { TEMPLATE_OPTIONS, loadTemplateLayout, type TemplateId } from "./services/templateService";
import { fetchElectionData, type RawQuestion } from "./utils/parseElectionData";

type ElectionKey = "election1" | "election2" | "election3" | "election4";

const ELECTION_OPTIONS: Array<{ value: ElectionKey; label: string }> = [
  { value: "election1", label: "Election 1" },
  { value: "election2", label: "Election 2" },
  { value: "election3", label: "Election 3" },
  { value: "election4", label: "Election 4" },
];

export default function App() {
  const [selectedElection, setSelectedElection] = useState<ElectionKey>("election1");
  const [selectedElectionData, setSelectedElectionData] = useState<RawQuestion[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadElection = async () => {
      try {
        const data = await fetchElectionData(selectedElection);
        if (!cancelled) {
          setSelectedElectionData(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setSelectedElectionData([]);
        }
      }
    };

    void loadElection();

    return () => {
      cancelled = true;
    };
  }, [selectedElection]);

  const {
    canvasItems,
    selectedId,
    selectedIds,
    editingItemId,
    selectOne,
    toggleSelect,
    clearSelection,
    setEditingItemId,
    handleLoadFile,
    handlePreviewPDF,
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
  } = useAppController({ electionData: selectedElectionData });

  const selectedItem = useMemo(
    () => canvasItems.find((item) => item.id === selectedId),
    [canvasItems, selectedId]
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <header className="flex h-14 w-full items-center border-b border-gray-300 bg-slate-200 px-6 shadow-sm">
        <h1 className="text-xl font-semibold">Votegrity Election Document Builder</h1>
      </header>

      <div className="flex">
        <AppSidebar
          tools={TOOL_DEFINITIONS}
          electionOptions={ELECTION_OPTIONS}
          templateOptions={TEMPLATE_OPTIONS}
          selectedElection={selectedElection}
          onSelectedElectionChange={(value) => setSelectedElection(value as ElectionKey)}
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
          selectedItem={selectedItem}
          onChangeItem={updateItem}
        />

        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <Canvas
            canvasItems={canvasItems}
            selectedId={selectedId}
            selectedIds={selectedIds}
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
    </DndContext>
  );
}
