import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export interface CanvasItem {
  id: string;
  type: 'text' | 'box' | 'image';
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  flags?: {
    isMovable: boolean;
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

  // Force light scheme so dark-mode UI does not affect PDF rendering
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
    // Popup blocked; fallback to download
    pdf.save("preview.pdf");
  }
}

// -------------------------------
// MULTI-PAGE PDF HELPERS
// -------------------------------

/** Capture a DOM element as a PNG data URL (for jsPDF). */
export async function captureElementAsPngDataUrl(elementId: string): Promise<string> {
  const node = document.getElementById(elementId);
  if (!node) throw new Error(`Could not find element with id="${elementId}"`);

  // Force light scheme so dark-mode UI does not affect PDF rendering
  document.documentElement.style.colorScheme = "light";

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
  });

  return canvas.toDataURL("image/png");
}

/** Open a multi-page PDF preview from an array of PNG data URLs (letter portrait). */
export function openPngPagesAsPdf(pngDataUrls: string[], filename = "preview.pdf") {
  if (pngDataUrls.length === 0) return;

  const pdf = new jsPDF({
    unit: "in",
    format: "letter",
    orientation: "portrait",
  });

  pngDataUrls.forEach((img, idx) => {
    if (idx > 0) pdf.addPage();
    pdf.addImage(img, "PNG", 0, 0, 8.5, 11);
  });

  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);

  const newTab = window.open("", "_blank");
  if (newTab) {
    newTab.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } else {
    pdf.save(filename);
  }
}
