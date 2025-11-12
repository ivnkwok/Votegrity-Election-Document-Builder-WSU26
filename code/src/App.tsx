import React, { useEffect, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { DraggableTool } from './components/Tool';
import { Droppable } from './components/Droppable';
import { previewElementAsPdf, loadLayoutFromFile } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Type Definitions ---
interface CanvasItem {
  id: string;
  type: 'text' | 'box';
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  flags?: {
    isMoveable: boolean;
    isEditable: boolean;
    minQuantity: number;
    maxQuantity: number;
  };
  styles?: React.CSSProperties;
}

export default function App() {
  const tools = [
    { id: 'candidate-name', content: 'Candidate Name' },
    { id: 'candidate-photo', content: 'Candidate Photo' },
    { id: 'votegrity-logo', content: 'Votegrity Logo' },
    { id: 'candidate-body', content: 'Candidate Body' },
  ];

  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- Keyboard Arrow Movement ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      const movement = e.shiftKey ? 10 : 1;
      setCanvasItems(prev =>
        prev.map(item => {
          if (item.id !== selectedId) return item;
          let { x, y } = item;
          switch (e.key) {
            case 'ArrowUp':
              y -= movement;
              break;
            case 'ArrowDown':
              y += movement;
              break;
            case 'ArrowLeft':
              x -= movement;
              break;
            case 'ArrowRight':
              x += movement;
              break;
            default:
              return item;
          }
          e.preventDefault();
          return { ...item, x: Math.max(0, x), y: Math.max(0, y) };
        })
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  const handleSelectItem = (id: string) => setSelectedId(id);

  const handleSaveLayout = () => {
    const exportData = {
    version: "1.0.0",
    canvas: { width: 816, height: 1056, background: "#ffffff", unit: "px" },
    components: canvasItems.map(item => ({
      id: item.id,
      type: item.type,
      content: item.type === "text" ? item.content || "" : "",
      position: { x: item.x, y: item.y },
      size: { width: item.width, height: item.height },
      styles: item.styles || {},
      flags: {isMoveable: true, isEditable: item.type === "text", minQuantity: item.type === "box" ? 0 : 1, maxQuantity: 1}
    }))
  };

    // Convert to JSON string
    const json = JSON.stringify(exportData, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layout.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadLayout = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const items = await loadLayoutFromFile(file);
      setCanvasItems(items);
    } catch (e) {
      alert('Invalid JSON layout. Please check the file format.');
      console.error(e);
    } finally {
      event.target.value = '';
    }
  };

    // --- PDF Preview ---
    const handlePreviewPDF = async () => {
      const page = document.getElementById("page");
      if (!page) throw new Error("Could not find #page element.");

      document.documentElement.style.colorScheme = "light";
      const canvas = await html2canvas(page, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        unit: "in",
        format: "letter",
        orientation: "portrait",
      });

      pdf.addImage(imgData, "PNG", 0, 0, 8.5, 11);

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      const newTab = window.open("", "_blank");
      if (newTab) {
        newTab.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const fallbackWindow = window.open(url, "_blank");
        if (!fallbackWindow) pdf.save("test.pdf");
      }
    };

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
            <Button variant="outline" onClick={handleSaveLayout}>Save Layout</Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                Load Layout
                <input type="file" accept="application/json" onChange={handleLoadLayout} className="hidden" />
              </label>
            </Button>
            <Button variant="outline" onClick={handlePreviewPDF}>Open PDF Preview</Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="w-3/5 border-black border-2 bg-slate-200 pt-4">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Canvas (Drag-and-Drop Area)</h2>
          <Droppable id="canvas">
            <div
              id="page"
              className="mx-auto bg-white rounded-md shadow-xl print:shadow-none h-screen"
              style={{ width: "8.5in", height: "11in", position: "relative" }}
              onClick={() => setSelectedId(null)}
            >
              {canvasItems.map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectItem(item.id);
                  }}
                  style={{
                    position: "absolute",
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    border: item.id === selectedId ? "2px solid blue" : "1px dashed #ccc",
                    padding: "4px",
                    cursor: "pointer",
                    backgroundColor: "white",
                  }}
                >
                  {item.content}
                </div>
              ))}
            </div>
          </Droppable>
        </div>
      </div>
    </DndContext>
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (over && over.id === "canvas") {
      const draggedToolId = active.id;
      const canvasRect = document.getElementById("page")?.getBoundingClientRect();
      if (!canvasRect) return;

      const x = Math.max(0, active.rect.current.translated.left - canvasRect.left);
      const y = Math.max(0, active.rect.current.translated.top - canvasRect.top);

      const draggedTool = tools.find((tool) => tool.id === draggedToolId);
      if (draggedTool) {
        const newItem: CanvasItem = {
          id: `${draggedTool.id}-${Date.now()}`,
          type: 'text',
          content: draggedTool.content,
          x,
          y,
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
