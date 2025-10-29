import React, {useState} from 'react';
import { Draggable } from './components/Draggable'
import { DndContext } from '@dnd-kit/core';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button"
import { DraggableTool } from './components/Tool'
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

  const handlePreviewPDF = async () => {
    const page = document.getElementById("page");             // Grab the DOM node we want to export
    if (!page) throw new Error("Could not find #page element.");

    // Force light color scheme so dark-mode CSS doesn't invert colors in the snapshot
    document.documentElement.style.colorScheme = "light";

    // Render the node to a canvas at 2x scale for sharper text; white background avoids transparency
    const canvas = await html2canvas(page, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");            // Convert canvas to a PNG data URL

    // Create a portrait, US Letter PDF with inch units for exact sizing
    const pdf = new jsPDF({
      unit: "in",
      format: "letter",
      orientation: "portrait",
    });

    // Place the image to fill the whole page: x=0, y=0, width=8.5in, height=11in
    pdf.addImage(imgData, "PNG", 0, 0, 8.5, 11);

    // Instantly downloads the PDF (not ideal)
    //pdf.save("test.pdf");

    // Replace the old pdf.save("test.pdf") with code to open in new tab instead
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    // Open a blank tab immediately
    const newTab = window.open("", "_blank");
    if (newTab) {
      newTab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } else {
      // Fallback if blocked
      const fallbackWindow = window.open(url, "_blank");
      if (!fallbackWindow) {
        pdf.save("test.pdf");
      }
    }
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
        <div className="py-5 grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          // <div className="w-1/2 border-black">
            <DraggableTool id={tool.id} toolText={tool.content}></DraggableTool>
          // </div>
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