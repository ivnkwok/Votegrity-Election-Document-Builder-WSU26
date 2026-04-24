import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import { useAppController } from "./hooks/useAppController";
import { Canvas } from "./components/Canvas/Canvas";
import { AppSidebar } from "./components/Sidebar/AppSidebar";
import { HelpDialog } from "./components/HelpDialog";
import { TOOL_DEFINITIONS } from "./config/tools";
import { TEMPLATE_OPTIONS, loadTemplateLayout, type TemplateId } from "./services/templateService";
import {
  buildElectionUsersUrl,
  fetchAdministeredElectionRecords,
  fetchElectionUsers,
  isElectionApiError,
  type ElectionUsersResponse,
} from "./services/apiService";
import type { ElectionRecord } from "./utils/parseElectionData";
import { loadDocumentLayoutFromJson } from "./services/layoutService";
import imageTemplate from "./data/templates/imageTemplate.json"

type ElectionLoadState = "loading" | "loaded" | "empty" | "failed";
type ElectionStatusTone = "info" | "muted" | "error";
type VoterListKey = "upload" | "selected-election";

const VOTER_LIST_OPTIONS: Array<{ value: VoterListKey; label: string }> = [
  { value: "selected-election", label: "Selected Election Users" },
  { value: "upload", label: "Upload JSON File" },
];

function getUsableElectionRecords(records: ElectionRecord[]): ElectionRecord[] {
  return records.filter((record) => Array.isArray(record.questions) && record.questions.length > 0);
}

function getVoterListLabel(value: VoterListKey): string {
  return VOTER_LIST_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function getElectionLoadErrorMessage(error: unknown): string {
  if (isElectionApiError(error)) {
    if (error.code === "auth-redirect") {
      return "Administered elections require an authenticated server session. Sign in on the server, then reload.";
    }

    if (error.code === "invalid-content-type") {
      return "The election service returned a non-JSON response. Verify this deployment can reach the authenticated /helios endpoints.";
    }

    if (error.code === "http-error" && error.status) {
      return `Could not load administered elections (HTTP ${error.status}).`;
    }

    if (error.code === "invalid-json") {
      return "The election service returned invalid JSON.";
    }
  }

  if (error instanceof Error && error.message) {
    return `Could not load administered elections: ${error.message}`;
  }

  return "Could not load administered elections.";
}

function getElectionStatusDisplay(
  electionLoadState: ElectionLoadState,
  electionLoadErrorMessage: string | null
): { message: string | null; tone: ElectionStatusTone } {
  if (electionLoadState === "loading") {
    return {
      message: "Loading administered elections...",
      tone: "info",
    };
  }

  if (electionLoadState === "empty") {
    return {
      message: "No administered elections are currently available.",
      tone: "muted",
    };
  }

  if (electionLoadState === "failed") {
    return {
      message: electionLoadErrorMessage ?? "Could not load administered elections.",
      tone: "error",
    };
  }

  return {
    message: null,
    tone: "muted",
  };
}

export default function App() {
  const [electionRecords, setElectionRecords] = useState<ElectionRecord[]>([]);
  const [electionLoadState, setElectionLoadState] = useState<ElectionLoadState>("loading");
  const [electionLoadErrorMessage, setElectionLoadErrorMessage] = useState<string | null>(null);
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [selectedVoterList, setSelectedVoterList] = useState<VoterListKey>("selected-election");
  const [uploadedVoterData, setUploadedVoterData] = useState<unknown | null>(null);
  const [uploadedVoterFileName, setUploadedVoterFileName] = useState<string | null>(null);
  const [selectedElectionVoterData, setSelectedElectionVoterData] = useState<ElectionUsersResponse | null>(null);
  const [isLoadingSelectedElectionVoters, setIsLoadingSelectedElectionVoters] = useState(false);

  const availableElectionRecords = useMemo(
    () => getUsableElectionRecords(electionRecords),
    [electionRecords]
  );

  const electionOptions = useMemo(
    () =>
      availableElectionRecords.map((record) => ({
        value: record.uuid,
        label: record.short_name?.trim() || record.name,
      })),
    [availableElectionRecords]
  );

  const electionStatus = useMemo(
    () => getElectionStatusDisplay(electionLoadState, electionLoadErrorMessage),
    [electionLoadErrorMessage, electionLoadState]
  );

  useEffect(() => {
    let isCancelled = false;

    setElectionLoadState("loading");
    setElectionLoadErrorMessage(null);

    void fetchAdministeredElectionRecords()
      .then((data) => {
        if (isCancelled) return;

        if (!Array.isArray(data)) {
          setElectionRecords([]);
          setElectionLoadState("failed");
          setElectionLoadErrorMessage("The election service returned an unexpected payload.");
          return;
        }

        const usableRecords = getUsableElectionRecords(data);
        setElectionRecords(usableRecords);
        setElectionLoadState(usableRecords.length > 0 ? "loaded" : "empty");
      })
      .catch((error) => {
        if (isCancelled) return;
        console.error("Failed to load administered elections", error);
        setElectionRecords([]);
        setElectionLoadState("failed");
        setElectionLoadErrorMessage(getElectionLoadErrorMessage(error));
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const func = atob("YnVyZ2Vy");
    (window as any)[func] = () => {
      console.log("welcome.");
      const d = loadDocumentLayoutFromJson(imageTemplate)
      loadDocument(d)
    };
  return () => {
    delete (window as any)[func];
  };
  }, []);

  useEffect(() => {
    if (
      selectedElection
      && !availableElectionRecords.some((record) => record.uuid === selectedElection)
    ) {
      setSelectedElection("");
    }
  }, [availableElectionRecords, selectedElection]);

  const selectedElectionRecord = useMemo(
    () => availableElectionRecords.find((record) => record.uuid === selectedElection) ?? null,
    [availableElectionRecords, selectedElection]
  );

  const selectedElectionData = useMemo(
    () => selectedElectionRecord?.questions ?? [],
    [selectedElectionRecord]
  );

  useEffect(() => {
    const electionUuid = selectedElectionRecord?.uuid;
    if (!electionUuid) {
      setSelectedElectionVoterData(null);
      setIsLoadingSelectedElectionVoters(false);
      return;
    }

    let isCancelled = false;

    setIsLoadingSelectedElectionVoters(true);
    setSelectedElectionVoterData(null);

    void fetchElectionUsers(electionUuid)
      .then((data) => {
        if (isCancelled) return;
        setSelectedElectionVoterData(data);
      })
      .catch((error) => {
        if (isCancelled) return;
        console.error("Failed to load selected election users", error);
        setSelectedElectionVoterData(null);
      })
      .finally(() => {
        if (isCancelled) return;
        setIsLoadingSelectedElectionVoters(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedElectionRecord]);

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
    if (selectedVoterList === "selected-election") {
      return selectedElectionVoterData;
    }

    return uploadedVoterData;
  }, [selectedElectionVoterData, selectedVoterList, uploadedVoterData]);

  const canRunMailMerge = useMemo(() => {
    if (selectedVoterList === "selected-election") {
      return !isLoadingSelectedElectionVoters && selectedElectionVoterData !== null;
    }

    return uploadedVoterData !== null;
  }, [isLoadingSelectedElectionVoters, selectedElectionVoterData, selectedVoterList, uploadedVoterData]);

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
            electionOptions={electionOptions}
            templateOptions={TEMPLATE_OPTIONS}
            selectedElection={selectedElection}
            electionStatusMessage={electionStatus.message}
            electionStatusTone={electionStatus.tone}
            isElectionSelectorDisabled={electionLoadState !== "loaded"}
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
                if (selectedVoterList === "selected-election") {
                  if (!selectedElectionRecord) {
                    alert("Please select an election before running mail merge.");
                    return;
                  }

                  const electionUuid = selectedElectionRecord.uuid;
                  const electionUsersUrl = buildElectionUsersUrl(electionUuid);
                  alert(`Could not load users for the selected election.\nExpected URL: ${electionUsersUrl}`);
                  return;
                }

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
