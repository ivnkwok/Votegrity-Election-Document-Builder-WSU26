import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";


export interface CanvasItem {
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


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function previewElementAsPdf(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) throw new Error(`Could not find element with id="${elementId}"`);

  // Force light scheme so dark-mode UI doesn't affect PDF rendering
  document.documentElement.style.colorScheme = "light";

  // Render DOM -> canvas
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/png");

  // Create PDF (letter portrait)
  const pdf = new jsPDF({
    unit: "in",
    format: "letter",
    orientation: "portrait",
  });

  pdf.addImage(imgData, "PNG", 0, 0, 8.5, 11);

  // Create a blob URL
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);

  // Try to open new tab for preview
  const newTab = window.open("", "_blank");
  if (newTab) {
    newTab.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } else {
    // Popup blocked — fallback to download
    pdf.save("preview.pdf");
  }
}

// Reads a JSON layout file and maps it to CanvasItem[]
export async function loadLayoutFromFile(file: File): Promise<CanvasItem[]> {
  const text = await file.text();
  const json = JSON.parse(text);

  if (!json || !Array.isArray(json.components)) {
    throw new Error("Invalid layout file — missing components array.");
  }

  return json.components.map((c: any) => ({
    id: c.id,
    type: c.type,
    content: c.content || "",
    x: c.position?.x ?? 0,
    y: c.position?.y ?? 0,
    width: c.size?.width ?? 100,
    height: c.size?.height ?? 50,
    styles: c.styles || {},
  }));
}