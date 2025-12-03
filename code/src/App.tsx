import { DndContext } from '@dnd-kit/core';
import { useAppController } from "./hooks/useAppController";
import { SidebarActions } from "@/components/Sidebar/SidebarActions";
import { SidebarTools } from './components/Sidebar/SidebarTools';
import { PropertiesPanel } from './components/Sidebar/PropertiesPanel';
import { Canvas } from './components/Canvas/Canvas';
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
    save,
  } = useAppController();

  // --- RENDER ---
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-2/5 border-black border-2 p-4 h-screen">
          <h2 className="text-center scroll-m-20 pb-4 text-3xl font-semibold tracking-tight first:mt-0">
            Palette/Core Navigation
          </h2>

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

          <SidebarTools tools={tools} />

          <SidebarActions
            onSave={save}
            onLoad={handleLoadFile}
            onPreview={() => { 
              setSelectedId(null); 
              requestAnimationFrame(handlePreviewPDF); 
            }} 
          />

          <PropertiesPanel item={canvasItems.find(i => i.id === selectedId)} />

        </div>
        {/* Canvas Area */}
        <div className="w-3/5 border-black border-2 bg-slate-200 pt-4">
          <h2 className="text-center text-3xl font-semibold tracking-tight pb-4">Canvas (Drag-and-Drop Area)</h2>
          <Canvas canvasItems={canvasItems} selectedId={selectedId} setSelectedId={setSelectedId}/>
        </div>
      </div>
    </DndContext>
  );
}