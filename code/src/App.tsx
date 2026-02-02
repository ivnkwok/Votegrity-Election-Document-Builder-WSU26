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
    updateItem,
  } = useAppController();

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

            <SidebarTools tools={tools} />

            <SidebarActions
              onSave={save}
              onLoad={handleLoadFile}
              onPreview={() => { 
                setSelectedId(null); 
                requestAnimationFrame(handlePreviewPDF); 
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