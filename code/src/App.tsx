import React, { useEffect, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { Button } from "@/components/ui/button";
import { DraggableTool } from './components/Tool';
import { Droppable } from './components/Droppable';
import { previewElementAsPdf } from '@/lib/utils.ts';
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

  // --- SAVE Layout (New Schema) ---
  const handleSaveLayout = () => {
    const layout = {
      version: "1.0.0",
      canvas: {
        width: 816,
        height: 1056,
        background: "#ffffff",
        unit: "px",
      },
      components: canvasItems.map(item => ({
        id: item.id,
        type: item.type,
        position: { x: item.x, y: item.y },
        size: { width: item.width ?? 200, height: item.height ?? 40 },
        content: item.content,
        flags: {
          isMoveable: item.flags?.isMoveable ?? true,
          isEditable: item.flags?.isEditable ?? true,
          minQuantity: item.flags?.minQuantity ?? 0,
          maxQuantity: item.flags?.maxQuantity ?? 1,
        },
        styles: item.styles ?? {
          fontFamily: "Inter, ui-sans-serif, system-ui",
          fontSize: 14,
          fontWeight: 400,
          color: "#111827",
          textAlign: "left",
        },
      })),
    };

    const json = JSON.stringify(layout, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "canvasLayout.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  // --- LOAD Layout (Supports Both Old & New Formats) ---
  const handleLoadLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const res = e.target?.result;
        if (typeof res !== "string") {
          alert("Failed to read file content.");
          return;
        }

        const json = JSON.parse(res);

        // New schema
        if (json?.components && Array.isArray(json.components)) {
          const mapped: CanvasItem[] = json.components.map((c: any) => ({
            id: String(c.id ?? ""),
            type: String(c.type ?? "text"),
            content: String(c.content ?? c.type ?? ""),
            x: Number(c.position?.x ?? 0),
            y: Number(c.position?.y ?? 0),
            width: Number(c.size?.width ?? 200),
            height: Number(c.size?.height ?? 40),
            flags: {
              isMoveable: Boolean(c.flags?.isMoveable ?? true),
              isEditable: Boolean(c.flags?.isEditable ?? true),
              minQuantity: Number(c.flags?.minQuantity ?? 0),
              maxQuantity: Number(c.flags?.maxQuantity ?? 1),
            },
            styles: c.styles ?? {},
          }));
          setCanvasItems(mapped);
        }
        // Old schema (flat array)
        else if (Array.isArray(json)) {
          const validated: CanvasItem[] = json.map((item) => ({
            id: String(item.id ?? ""),
            type: String(item.type ?? "text"),
            content: String(item.content ?? ""),
            x: Number(item.x ?? 0),
            y: Number(item.y ?? 0),
            flags: {
              isMoveable: true,
              isEditable: true,
              minQuantity: 0,
              maxQuantity: 1,
            },
          }));
          setCanvasItems(validated);
        } else {
          alert("Invalid layout format");
        }
      } catch (err) {
        console.error(err);
        alert("Error parsing layout JSON");
      }
    };
    reader.readAsText(file);
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