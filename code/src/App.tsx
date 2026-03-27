import { DndContext } from '@dnd-kit/core';
import { useAppController } from "./hooks/useAppController";
import { SidebarActions } from "@/components/Sidebar/SidebarActions";
import { SidebarTools } from './components/Sidebar/SidebarTools';
import { PropertiesPanel } from './components/Sidebar/PropertiesPanel';
import { Canvas } from './components/Canvas/Canvas';
import { PdfUploader } from './components/PdfUploader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOOL_DEFINITIONS } from './config/tools';
import election1 from "./data/Election207.json";
import election2 from "./data/election365.json";
import election3 from "./data/election458.json";
import election4 from "./data/election488.json";

const electionDataSets = {
  election1,
  election2,
  election3,
  election4,
} as const;

export default function App() {
  const tools = TOOL_DEFINITIONS; // Load tool definitions
  type ElectionKey = keyof typeof electionDataSets;
  const [selectedElection, setSelectedElection] = useState<ElectionKey>("election1");
  const selectedElectionData = useMemo(
    () => electionDataSets[selectedElection],
    [selectedElection]
  );
  // Use the app controller hook to manage state and handlers
  const {
    canvasItems,
    selectedId,
    editingItemId,
    setSelectedId,
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
  } = useAppController({ electionData: selectedElectionData });

  const activePageIndex = useMemo(
    () => pageOrder.indexOf(activePageId),
    [pageOrder, activePageId]
  );

  const canMoveUp = activePageIndex > 0;
  const canMoveDown = activePageIndex >= 0 && activePageIndex < pageOrder.length - 1;
  const currentPageName = pageNamesById[activePageId] ?? "";
  const [pageNameDraft, setPageNameDraft] = useState(currentPageName);

  useEffect(() => {
    setPageNameDraft(currentPageName);
  }, [currentPageName]);

  const commitPageName = () => {
    const clean = pageNameDraft.trim();
    if (!clean) {
      setPageNameDraft(currentPageName);
      return;
    }

    renamePage(pageNameDraft, activePageId);
    setPageNameDraft(clean);
  };

  // --- RENDER ---
  return (
    <DndContext onDragEnd={handleDragEnd}>

      {/* App Header */}
      <header className="w-full h-14 border-b border-gray-300 bg-slate-200 flex items-center px-6 shadow-sm">
        <h1 className="text-xl font-semibold">Votegrity Election Document Builder</h1>
      </header>

      <div className="flex">
      
        {/* Sidebar Area */}
        <div className="w-[380px] h-screen bg-white border-r border-gray-300 flex flex-col">

          <div className="flex-1 space-y-6 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Election Data</div>
              <Select
                value={selectedElection}
                onValueChange={(value) => setSelectedElection(value as ElectionKey)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Election" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="election1">Election 1</SelectItem>
                  <SelectItem value="election2">Election 2</SelectItem>
                  <SelectItem value="election3">Election 3</SelectItem>
                  <SelectItem value="election4">Election 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ballot Template">Ballot Template</SelectItem>
                <SelectItem value="Notice Template">Notice Template</SelectItem>
                <SelectItem value="Candidate Statement Template">Candidate Statement Template</SelectItem>
              </SelectContent>
            </Select>

            {/* --- Page Selector --- */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Page</div>

              <Select value={activePageId} onValueChange={switchPage}>
                <Input
                  value={pageNameDraft}
                  placeholder="Rename page"
                  onChange={(e) => setPageNameDraft(e.target.value)}
                  onBlur={commitPageName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitPageName();
                      e.currentTarget.blur();
                    }
                    if (e.key === "Escape") {
                      setPageNameDraft(currentPageName);
                      e.currentTarget.blur();
                    }
                  }}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => movePage(activePageId, -1)}
                    disabled={!canMoveUp}
                  >
                    Move Up
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => movePage(activePageId, 1)}
                    disabled={!canMoveDown}
                  >
                    Move Down
                  </Button>
                </div>

                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  {pageOrder.map((pageId) => (
                    <SelectItem key={pageId} value={pageId}>
                      {pageNamesById[pageId] ?? pageId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={addPage}>
                  + Add
                </Button>
                <Button variant="outline" className="flex-1" onClick={duplicatePage}>
                  Duplicate
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={deletePage}
                disabled={pageOrder.length <= 1}
              >
                Delete Page
              </Button>
            </div>

            <SidebarTools tools={tools} />

            <PdfUploader onPdfPagesExtracted={handlePdfImport} />

            <SidebarActions
              onSave={save}
              onLoad={handleLoadFile}
              onPreview={() => {
                setSelectedId(null);
                setEditingItemId(null);
                requestAnimationFrame(() => {
                  void handlePreviewPDF();
                });
              }}
            />
            <PropertiesPanel item={canvasItems.find(i => i.id === selectedId)} 
              onChange={updateItem}  
            />

          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-6 bg-gray-100 overflow-auto">
          <Canvas
            canvasItems={canvasItems}
            selectedId={selectedId}
            editingItemId={editingItemId}
            setSelectedId={setSelectedId}
            setEditingItemId={setEditingItemId}
            onChangeItem={updateItem}
          />
        </div>
      </div>

    </DndContext>
  );
}
