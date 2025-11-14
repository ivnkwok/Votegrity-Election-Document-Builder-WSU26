import React, { useEffect, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { Button } from "@/components/ui/button"
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
  width: number;
  height: number;
  styles?: React.CSSProperties;
}

interface DraggableProps {
  id: string;
  children: React.ReactNode;
}

interface DroppableProps {
  id: string;
  children: React.ReactNode;
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

  const handlePreviewPDF = () => previewElementAsPdf('page');

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex">
        <div className="w-2/5 border-black border-2 p-4 h-screen">
          <h2 className="text-center scroll-m-20 pb-4 text-3xl font-semibold tracking-tight first:mt-0">Palette/Core Navigation</h2>
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
          <div className="flex flex-wrap">
            {tools.map((tool) => (
              <div className="w-1/2" key={tool.id}>
                <Draggable id={tool.id}>
                  <div className="p-1 border-black border-2 h-16 flex items-center justify-center">
                    {tool.content}
                  </div>
                </Draggable>
              </div>
            ))}
          </div>
          
          {/* Save/Load + Preview buttons */}
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
        <div className="w-3/5 border-black border-2 bg-slate-200 p-4">
          <h2 className="text-center text-3xl font-semibold">Canvas (Drag-and-Drop Area)</h2>
          <div
            id="page"
            className="mx-auto mt-4 bg-white rounded-md shadow relative"
            style={{ width: '8.5in', height: '11in', position: 'relative' }}
          >
            {canvasItems.map((item) => (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  overflow: 'hidden',
                  border: item.type === 'box' ? '1px solid #000' : undefined,
                  ...item.styles,
                }}
              >
                {item.type === 'text' && <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>}
              </div>
            ))}
          </div>
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
