import { useState, useCallback } from "react";
import type { CanvasItem } from "@/lib/utils";
import { saveLayout, loadLayout } from "@/services/layoutService";
import { previewElementAsPdf } from "@/lib/utils";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { useCanvasDnd } from "./useCanvasDnd";

export function useAppController() {
  // ----------------------------
  // State
  // ----------------------------
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Enable keyboard nudging for the selected item
  useKeyboardMovement(selectedId, setCanvasItems);

  // File loading handler
  const handleLoadFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const items = await loadLayout(file);
      setCanvasItems(items);
    } catch (err) {
      console.error(err);
      alert("Error loading layout.");
    }
  }, []);

  // PDF preview handler
  const handlePreviewPDF = useCallback(() => {
    previewElementAsPdf("page");
  }, []);

  // Drag and drop handler
  const handleDragEnd = useCanvasDnd({
    canvasItems,
    setCanvasItems,
    setSelectedId,
  });

  // Return state and handlers
  return {
    // state
    canvasItems,
    selectedId,

    // setters
    setCanvasItems,
    setSelectedId,

    // handlers
    handleLoadFile,
    handlePreviewPDF,
    handleDragEnd,

    // convenience wrappers
    save: () => saveLayout(canvasItems),
  };
}
