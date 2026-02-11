import { DndContext } from '@dnd-kit/core';
import { useAppController } from "./hooks/useAppController";
import { SidebarActions } from "@/components/Sidebar/SidebarActions";
import { SidebarTools } from './components/Sidebar/SidebarTools';
import { PropertiesPanel } from './components/Sidebar/PropertiesPanel';
import { Canvas } from './components/Canvas/Canvas';
import { PdfUploader } from './components/PdfUploader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOOL_DEFINITIONS } from './config/tools';

export default function App() {
  const tools = TOOL_DEFINITIONS; // Load tool definitions

  // Use the app controller hook to manage state and handlers
  const {
    canvasItems,
    selectedId,
    setSelectedId,
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
  } = useAppController();

  const activePageIndex = useMemo(
    () => pageOrder.indexOf(activePageId),
    [pageOrder, activePageId]
  );

  const canMoveUp = activePageIndex > 0;
  const canMoveDown = activePageIndex >= 0 && activePageIndex < pageOrder.length - 1;

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
                  value={pageNamesById[activePageId] ?? ""}
                  placeholder="Rename page"
                  onChange={(e) => renamePage(e.target.value, activePageId)}
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
          <Canvas canvasItems={canvasItems} selectedId={selectedId} setSelectedId={setSelectedId}/>
        </div>
      </div>

    </DndContext>
  );
}