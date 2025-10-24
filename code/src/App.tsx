import React, {useState} from 'react';
import {Draggable} from './components/Draggable'
import { DndContext } from '@dnd-kit/core';
import { Button } from "@/components/ui/button"
import { previewElementAsPdf } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// --- Type Definitions ---

interface Tool {
  id: string;
  content: string;
}

interface CanvasItem {
  id: string;
  content: string;
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
    { id: 'candidate-photo', content: 'Candidate Photo'},
    { id: 'votegrity-logo', content: 'Votegrity Logo'},
    { id: 'candidate-body', content: 'Candidate Body'},
  ]
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);

  const draggableMarkup = (
    <Draggable id="draggable">Drag me</Draggable>
  );

  const handleSaveLayout = () => {
    const json = JSON.stringify(canvasItems, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvasLayout.json';
    a.click();

    URL.revokeObjectURL(url);
  };
  const handleLoadLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const res = e.target?.result
        if (typeof res !== 'string') {
          alert('Failed to read file content.')
          return;
        }
        const json = JSON.parse(res);
        if (Array.isArray(json)) {
          //problem with this line
          // setCanvasItems(json)
        } else {
          alert('Invalid layout file');
        }
      } catch (err) {
        alert('Error parsing layout JSON');
      }
    };
    reader.readAsText(file);
  };

  const handlePreviewPDF = () => {
    previewElementAsPdf("page");
  };

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
          <div className="w-1/2">
            <Draggable key={tool.id} id={tool.id}>
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
              <label className="cursor">
                Load Layout
                <input type="file" accept="application/json" onChange={handleLoadLayout} className="hidden"/>
              </label>
            </Button>
            <Button variant="outline" onClick={handlePreviewPDF}>Open PDF Preview</Button>
          </div>
          
      </div>
      {/* Canvas Area */}
        <div className="w-3/5 border-black border-2 bg-slate-200 space-y-5 mb-5 p-4">
          <h2 className="text-center scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">Canvas (Drag-and-Drop Area)</h2>
          {/* Letter size page area for dropping components */}
          <div
            id="page"
            className="mx-auto mb-16 bg-white rounded-md shadow-xl print:shadow-none h-screen"
            style={{ width: '8.5in', height: '11in' }}
          >
            <h2 className="pt-10 text-center text-xl font-bold">
              This is a sample page for PDF preview.
            </h2>
          </div>
        </div>
    </div>
    </DndContext>
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    //if dropped onto canvas
    if (over && over.id === 'canvas') {
      const draggedToolId = active.id;

      //find the tool that was dragged
      const draggedTool = tools.find(tool => tool.id === draggedToolId);

      if (draggedTool) {
        //add new item to canvas
        const newItem = {
          id: `${draggedTool.id}-${Date.now()}`,
          content: draggedTool.content,
        };
        setCanvasItems((items) => [...items, newItem]);
      }
    }
  }
};