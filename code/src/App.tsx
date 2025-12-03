import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { Button } from "@/components/ui/button";
import { DraggableTool } from './components/Tool';
import { SidebarTools } from './components/Sidebar/SidebarTools';
import { PropertiesPanel } from './components/Sidebar/PropertiesPanel';
import { previewElementAsPdf } from '@/lib/utils.ts';
import { saveLayout, loadLayout } from '@/services/layoutService';
import { useKeyboardMovement } from './hooks/useKeyboardMovement';
import { useCanvasDnd } from "./hooks/useCanvasDnd";
import { Canvas } from './components/Canvas/Canvas';
import type { CanvasItem } from '@/lib/utils';
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

  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Enable keyboard (arrow key) pixel nudge for selected items
  useKeyboardMovement(selectedId, setCanvasItems);

  // ------------ HANDLERS ------------

  // --- Load Layout ---
  const handleLoadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const items = await loadLayout(file);
      setCanvasItems(items);
    } catch (err) {
      console.error(err);
      alert("Error loading layout.");
    }
  };

  // --- PDF Preview ---
  const handlePreviewPDF = () => { previewElementAsPdf("page"); };

  // --- Drag-and-Drop ---
  const handleDragEnd = useCanvasDnd({
    canvasItems,
    setCanvasItems,
    setSelectedId,
  });

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

          {/* Save/Load/Preview Buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" onClick={() => saveLayout(canvasItems)}>Save Layout</Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                Load Layout
                <input type="file" accept="application/json" onChange={handleLoadFile} className="hidden" />
              </label>
            </Button>
            <Button variant="outline" onClick={() => { setSelectedId(null); requestAnimationFrame(() => { handlePreviewPDF(); }) }}>Open PDF Preview</Button>
          </div>

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