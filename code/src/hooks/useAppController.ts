import { useCallback, useEffect, useState } from "react";
import type { CanvasItem } from "@/lib/utils";
import {
  saveDocumentLayout,
  loadDocumentLayout,
  type LoadedDocument,
} from "@/services/layoutService";
import { captureElementAsPngDataUrl, openPngPagesAsPdf } from "@/lib/utils";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { useCanvasDnd } from "./useCanvasDnd";
import type { RawQuestion } from "@/utils/parseElectionData";
import { buildImportedPdfPages } from "./appController/pageUtils";
import { usePageState } from "./appController/usePageState";

interface UseAppControllerArgs {
  electionData: RawQuestion[];
}

export function useAppController({ electionData }: UseAppControllerArgs) {
  const {
    canvasItems,
    setCanvasItems,
    selectedId,
    setSelectedId: setPrimarySelectedId,
    editingItemId,
    setEditingItemId,
    pageOrder,
    setPageOrder,
    activePageId,
    setActivePageId,
    pageNamesById,
    setPageNamesById,
    pagesById,
    setPagesById,
    switchPage: switchPageBase,
    addPage: addPageBase,
    duplicatePage: duplicatePageBase,
    deletePage: deletePageBase,
    renamePage,
    movePage,
  } = usePageState();

  const [selectedIdsState, setSelectedIdsState] = useState<Set<string>>(new Set());

  const setSelectedIds = useCallback((value: React.SetStateAction<Set<string>>) => {
    setSelectedIdsState((prev) => {
      const next = typeof value === "function"
        ? (value as (prevState: Set<string>) => Set<string>)(prev)
        : value;

      const normalized = new Set(next);
      const nextSelectedId = normalized.size === 1
        ? normalized.values().next().value ?? null
        : null;
      setPrimarySelectedId(nextSelectedId);
      return normalized;
    });
  }, [setPrimarySelectedId]);

  const setSelectedId = useCallback((id: string | null) => {
    setPrimarySelectedId(id);
    setSelectedIdsState(id ? new Set([id]) : new Set());
  }, [setPrimarySelectedId]);

  const selectOne = useCallback((id: string | null) => {
    setSelectedId(id);
  }, [setSelectedId]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, [setSelectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, [setSelectedId]);

  const switchPage = useCallback((nextPageId: string) => {
    switchPageBase(nextPageId);
    setSelectedIdsState(new Set());
  }, [switchPageBase]);

  const addPage = useCallback(() => {
    addPageBase();
    setSelectedIdsState(new Set());
  }, [addPageBase]);

  const duplicatePage = useCallback(() => {
    duplicatePageBase();
    setSelectedIdsState(new Set());
  }, [duplicatePageBase]);

  const deletePage = useCallback(() => {
    deletePageBase();
    setSelectedIdsState(new Set());
  }, [deletePageBase]);

  useEffect(() => {
    if (!editingItemId) return;
    if (selectedId === editingItemId) return;
    setEditingItemId(null);
  }, [editingItemId, selectedId, setEditingItemId]);

  useKeyboardMovement(selectedIdsState, editingItemId, setCanvasItems);

  const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const loadDocument = useCallback((doc: LoadedDocument) => {
    setPageOrder(doc.pageOrder);
    setPageNamesById(doc.pageNamesById);
    setPagesById(doc.pagesById);

    const firstPageId = doc.pageOrder[0] ?? "page-1";
    setActivePageId(firstPageId);
    setSelectedId(null);
    setEditingItemId(null);
    setCanvasItems(doc.pagesById[firstPageId] ?? []);
  }, [setActivePageId, setCanvasItems, setEditingItemId, setPageNamesById, setPageOrder, setPagesById, setSelectedId]);

  const handleLoadFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const doc = await loadDocumentLayout(file);
      loadDocument(doc);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error loading layout.";
      alert(message);
    }
  }, [loadDocument]);

  const handlePreviewPDF = useCallback(async () => {
    const originalPageId = activePageId;
    const originalItems = canvasItems;

    const docPagesById: Record<string, CanvasItem[]> = {
      ...pagesById,
      [activePageId]: canvasItems,
    };

    const images: string[] = [];

    for (const pageId of pageOrder) {
      const items = docPagesById[pageId] ?? [];

      setSelectedId(null);
      setEditingItemId(null);
      setActivePageId(pageId);
      setCanvasItems(items);

      await nextFrame();
      await nextFrame();

      const png = await captureElementAsPngDataUrl("page");
      images.push(png);
    }

    openPngPagesAsPdf(images);

    setSelectedId(null);
    setEditingItemId(null);
    setActivePageId(originalPageId);
    setCanvasItems(originalItems);
  }, [activePageId, canvasItems, pageOrder, pagesById, setActivePageId, setCanvasItems, setEditingItemId, setSelectedId]);

  const handleDragEnd = useCanvasDnd({
    canvasItems,
    electionData,
    selectedIds: selectedIdsState,
    setCanvasItems,
    setSelectedIds,
    selectOne,
    toggleSelect,
  });

  const updateItem = (id: string, updates: Partial<CanvasItem>) => {
    setCanvasItems((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    if (updates.id) {
      setSelectedIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        next.add(updates.id!);
        return next;
      });

      if (editingItemId === id) {
        setEditingItemId(updates.id);
      }
    }
  };

  const handlePdfImport = useCallback(
    (images: { dataUrl: string; pageNumber: number }[]) => {
      if (images.length === 0) return;

      const { newPageIds, importedPagesById, importedPageNamesById } = buildImportedPdfPages(images);

      setPagesById((prev) => ({
        ...prev,
        [activePageId]: canvasItems,
        ...importedPagesById,
      }));
      setPageNamesById((prev) => ({ ...prev, ...importedPageNamesById }));
      setPageOrder((prev) => [...prev, ...newPageIds]);

      if (newPageIds.length > 0) {
        const firstPageId = newPageIds[0];
        setActivePageId(firstPageId);
        setCanvasItems(importedPagesById[firstPageId] ?? []);
        setSelectedId(null);
        setEditingItemId(null);
      }
    },
    [activePageId, canvasItems, setActivePageId, setCanvasItems, setEditingItemId, setPageNamesById, setPageOrder, setPagesById, setSelectedId]
  );

  return {
    canvasItems,
    selectedId,
    selectedIds: selectedIdsState,
    editingItemId,
    pageOrder,
    activePageId,
    pageNamesById,

    setCanvasItems,
    setSelectedId,
    setSelectedIds,
    setEditingItemId,

    selectOne,
    toggleSelect,
    clearSelection,

    handleLoadFile,
    handlePreviewPDF,
    handleDragEnd,
    handlePdfImport,
    switchPage,
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
    movePage,
    updateItem,
    loadDocument,

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
