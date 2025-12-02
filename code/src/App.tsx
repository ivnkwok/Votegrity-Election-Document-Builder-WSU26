import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { Button } from "@/components/ui/button";
import { Draggable } from './components/Draggable';
import { DraggableTool } from './components/Tool';
import { previewElementAsPdf } from '@/lib/utils.ts';
import { saveLayout, loadLayout } from '@/services/layoutService';
import { useKeyboardMovement } from './hooks/useKeyboardMovement';
import { Canvas } from './components/Canvas/Canvas';
import type { CanvasItem } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function App() {
  const tools = [
    { id: 'candidate-name', content: 'Candidate Name' },
    { id: 'candidate-photo', content: 'Candidate Photo' },
    { id: 'votegrity-logo', content: 'Votegrity Logo' },
    { id: 'candidate-body', content: 'Candidate Body' },
  ];

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

          <div className="py-5 grid grid-cols-2 gap-2">
            {tools.map((tool) => (
              <DraggableTool key={tool.id} id={tool.id} toolText={tool.content} />
            ))}
          </div>

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
        </div>
        {/* Canvas Area */}
        <div className="w-3/5 border-black border-2 bg-slate-200 pt-4">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Canvas (Drag-and-Drop Area)</h2>
          <Canvas canvasItems={canvasItems} selectedId={selectedId} setSelectedId={setSelectedId}/>
        </div>
      </div>
    </DndContext>
  );

  function handleDragEnd(event: any) {
    const { active, over, delta } = event;
    const canvasRect = document.getElementById("page")?.getBoundingClientRect();
    // existing item drag
    const isExistingItem = canvasItems.find((item) => item.id === active.id);
    //active drag data
    let translated = active.rect.current.translated

    if (isExistingItem) {
      setCanvasItems((prev) =>
        prev.map((item) => {
          if (item.id === active.id) {
            if (canvasRect){
              let newX = translated.left - canvasRect.left
              let newY = translated.top - canvasRect.top
              
              let w = translated.width
              let h = translated.height

              return {
                ...item,
                x: Math.max(0, Math.min(newX, canvasRect.width - w)),
                y: Math.max(0, Math.min(newY, canvasRect.height - h)),
              };
            }
          }
          return item;
        })
      );
      return;
    }

    // new item drag
    if (over && over.id === "canvas") {
      const draggedToolId = active.id;
      if (!canvasRect) return;

      // Calculate position relative to canvas
      let newX = translated.left - canvasRect.left
      let newY = translated.top - canvasRect.top
      
      let w = translated.width
      let h = translated.height

      const draggedTool = tools.find((tool) => tool.id === draggedToolId);
      if (draggedTool) {
        const newItem: CanvasItem = {
          id: `${draggedTool.id}-${Date.now()}`,
          type: 'text',
          content: draggedTool.content,
          x: Math.max(0, Math.min(newX, canvasRect.width)),
          y: Math.max(0, Math.min(newY, canvasRect.height)),
          width: 200,
          height: 40,
          flags: {
            isMoveable: true,
            isEditable: true,
            minQuantity: 0,
            maxQuantity: 1,
          },
        };
        setCanvasItems((items) => [...items, newItem]);
      }
    }
  }
}