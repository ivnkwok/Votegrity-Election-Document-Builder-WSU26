import { useState, useCallback } from "react";
import type { CanvasItem } from "@/lib/utils";
import {
  saveDocumentLayout,
  loadDocumentLayout,
  type LoadedDocument,
} from "@/services/layoutService";
import { captureElementAsPngDataUrl, openPngPagesAsPdf } from "@/lib/utils";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { useCanvasDnd } from "./useCanvasDnd";

export function useAppController() {
  // ----------------------------
  // State
  // ----------------------------
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- Multi-page state (simple save/load swap) ---
  const [pageOrder, setPageOrder] = useState<string[]>(["page-1"]);
  const [activePageId, setActivePageId] = useState<string>("page-1");
  const [pageNamesById, setPageNamesById] = useState<Record<string, string>>({
    "page-1": "Page 1",
  });
  const [pagesById, setPagesById] = useState<Record<string, CanvasItem[]>>({
    "page-1": [],
  });

  // Enable keyboard nudging for the selected item
  useKeyboardMovement(selectedId, setCanvasItems);

  const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

  /** Switch pages by saving current canvas, then loading the target page into the canvas. */
  const switchPage = useCallback(
    (nextPageId: string) => {
      if (!nextPageId || nextPageId === activePageId) return;

      const nextItems = pagesById[nextPageId] ?? [];

      // Save current page, then load target
      setPagesById((prev) => ({ ...prev, [activePageId]: canvasItems }));
      setSelectedId(null);
      setCanvasItems(nextItems);
      setActivePageId(nextPageId);
    },
    [activePageId, canvasItems, pagesById]
  );

  /** Add a new blank page and switch to it. */
  const addPage = useCallback(() => {
    const newIndex = pageOrder.length + 1;
    const newId = `page-${newIndex}`;
    const newName = `Page ${newIndex}`;

    // Save current page first
    setPagesById((prev) => ({ ...prev, [activePageId]: canvasItems, [newId]: [] }));
    setPageNamesById((prev) => ({ ...prev, [newId]: newName }));
    setPageOrder((prev) => [...prev, newId]);

    setSelectedId(null);
    setCanvasItems([]);
    setActivePageId(newId);
  }, [activePageId, canvasItems, pageOrder.length]);

  /** Duplicate the current page (deep clone items) and switch to the duplicate. */
  const duplicatePage = useCallback(() => {
    const newIndex = pageOrder.length + 1;
    const newId = `page-${newIndex}`;
    const newName = `Page ${newIndex}`;

    const sourceItems = canvasItems;
    const cloned = JSON.parse(JSON.stringify(sourceItems)) as CanvasItem[];

    setPagesById((prev) => ({ ...prev, [activePageId]: sourceItems, [newId]: cloned }));
    setPageNamesById((prev) => ({ ...prev, [newId]: newName }));
    setPageOrder((prev) => [...prev, newId]);

    setSelectedId(null);
    setCanvasItems(cloned);
    setActivePageId(newId);
  }, [activePageId, canvasItems, pageOrder.length]);

  /** Delete the current page (keeps at least one page). */
  const deletePage = useCallback(() => {
    if (pageOrder.length <= 1) return;

    const idx = pageOrder.indexOf(activePageId);
    const nextId = pageOrder[idx - 1] ?? pageOrder[idx + 1] ?? pageOrder[0];
    if (!nextId || nextId === activePageId) return;

    // Save current page before removing
    const currentSaved = canvasItems;

    setPagesById((prev) => {
      const copy = { ...prev, [activePageId]: currentSaved };
      delete copy[activePageId];
      return copy;
    });

    setPageNamesById((prev) => {
      const copy = { ...prev };
      delete copy[activePageId];
      return copy;
    });

    setPageOrder((prev) => prev.filter((id) => id !== activePageId));

    setSelectedId(null);
    setCanvasItems(pagesById[nextId] ?? []);
    setActivePageId(nextId);
  }, [activePageId, canvasItems, pageOrder, pagesById]);

  /** Rename a page (defaults to active page if not provided). */
  const renamePage = useCallback(
    (newName: string, pageId?: string) => {
      const id = pageId ?? activePageId;
      const clean = (newName ?? "").trim();
      if (!clean) return;

      setPageNamesById((prev) => ({ ...prev, [id]: clean }));
    },
    [activePageId]
  );

  /** Reorder a page in pageOrder by moving it one step (-1 up, +1 down). */
  const movePage = useCallback(
    (pageId: string, delta: -1 | 1) => {
      setPageOrder((prev) => {
        const idx = prev.indexOf(pageId);
        if (idx === -1) return prev;

        const nextIdx = idx + delta;
        if (nextIdx < 0 || nextIdx >= prev.length) return prev;

        const copy = [...prev];
        const [removed] = copy.splice(idx, 1);
        copy.splice(nextIdx, 0, removed);
        return copy;
      });
    },
    []
  );

  // File loading handler
  const handleLoadFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const doc = await loadDocumentLayout(file);

      setPageOrder(doc.pageOrder);
      setPageNamesById(doc.pageNamesById);
      setPagesById(doc.pagesById);

      const firstPageId = doc.pageOrder[0] ?? "page-1";
      setActivePageId(firstPageId);
      setSelectedId(null);
      setCanvasItems(doc.pagesById[firstPageId] ?? []);
    } catch (err) {
      console.error(err);
      alert("Error loading layout.");
    }
  }, []);

  // Multi-page PDF preview handler
  const handlePreviewPDF = useCallback(async () => {
    // Save the current page before exporting
    const originalPageId = activePageId;
    const originalItems = canvasItems;

    // Make sure the store has the latest for current page
    const docPagesById: Record<string, CanvasItem[]> = {
      ...pagesById,
      [activePageId]: canvasItems,
    };

    const images: string[] = [];

    for (const pageId of pageOrder) {
      const items = docPagesById[pageId] ?? [];

      // Load page into the visible canvas
      setSelectedId(null);
      setActivePageId(pageId);
      setCanvasItems(items);

      // Wait for React to paint before html2canvas
      await nextFrame();
      await nextFrame();

      const png = await captureElementAsPngDataUrl("page");
      images.push(png);
    }

    openPngPagesAsPdf(images);

    // Restore original page
    setSelectedId(null);
    setActivePageId(originalPageId);
    setCanvasItems(originalItems);
  }, [activePageId, canvasItems, pageOrder, pagesById]);

  // Drag and drop handler
  const handleDragEnd = useCanvasDnd({
    canvasItems,
    setCanvasItems,
    setSelectedId,
  });

  return {
    // state
    canvasItems,
    selectedId,
    pageOrder,
    activePageId,
    pageNamesById,

    // setters
    setCanvasItems,
    setSelectedId,

    // handlers
    handleLoadFile,
    handlePreviewPDF,
    handleDragEnd,
    switchPage,
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
    movePage,


    // save whole document
    save: () => {
      const doc: LoadedDocument = {
        pageOrder,
        pageNamesById,
        pagesById: { ...pagesById, [activePageId]: canvasItems },
      };
      saveDocumentLayout(doc);
    },
  };
}
