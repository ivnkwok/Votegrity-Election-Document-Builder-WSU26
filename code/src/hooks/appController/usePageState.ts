import { useCallback, useState } from "react";
import type { CanvasItem } from "@/lib/utils";
import { cloneCanvasItems, getNextPageId } from "./pageUtils";

export interface UsePageStateResult {
  canvasItems: CanvasItem[];
  setCanvasItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;
  pageOrder: string[];
  setPageOrder: React.Dispatch<React.SetStateAction<string[]>>;
  activePageId: string;
  setActivePageId: (id: string) => void;
  pageNamesById: Record<string, string>;
  setPageNamesById: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  pagesById: Record<string, CanvasItem[]>;
  setPagesById: React.Dispatch<React.SetStateAction<Record<string, CanvasItem[]>>>;
  switchPage: (nextPageId: string) => void;
  addPage: () => void;
  duplicatePage: () => void;
  deletePage: () => void;
  renamePage: (newName: string, pageId?: string) => void;
  movePage: (pageId: string, delta: -1 | 1) => void;
}

export function usePageState(): UsePageStateResult {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [pageOrder, setPageOrder] = useState<string[]>(["page-1"]);
  const [activePageId, setActivePageId] = useState<string>("page-1");
  const [pageNamesById, setPageNamesById] = useState<Record<string, string>>({
    "page-1": "Page 1",
  });
  const [pagesById, setPagesById] = useState<Record<string, CanvasItem[]>>({
    "page-1": [],
  });

  const switchPage = useCallback(
    (nextPageId: string) => {
      if (!nextPageId || nextPageId === activePageId) return;

      const nextItems = pagesById[nextPageId] ?? [];

      setPagesById((prev) => ({ ...prev, [activePageId]: canvasItems }));
      setSelectedId(null);
      setEditingItemId(null);
      setCanvasItems(nextItems);
      setActivePageId(nextPageId);
    },
    [activePageId, canvasItems, pagesById]
  );

  const addPage = useCallback(() => {
    const newId = getNextPageId(pageOrder);
    const newName = `Page ${newId.replace("page-", "")}`;

    setPagesById((prev) => ({ ...prev, [activePageId]: canvasItems, [newId]: [] }));
    setPageNamesById((prev) => ({ ...prev, [newId]: newName }));
    setPageOrder((prev) => [...prev, newId]);

    setSelectedId(null);
    setEditingItemId(null);
    setCanvasItems([]);
    setActivePageId(newId);
  }, [activePageId, canvasItems, pageOrder]);

  const duplicatePage = useCallback(() => {
    const newId = getNextPageId(pageOrder);
    const newName = `Page ${newId.replace("page-", "")}`;

    const sourceItems = canvasItems;
    const cloned = cloneCanvasItems(sourceItems);

    setPagesById((prev) => ({ ...prev, [activePageId]: sourceItems, [newId]: cloned }));
    setPageNamesById((prev) => ({ ...prev, [newId]: newName }));
    setPageOrder((prev) => [...prev, newId]);

    setSelectedId(null);
    setEditingItemId(null);
    setCanvasItems(cloned);
    setActivePageId(newId);
  }, [activePageId, canvasItems, pageOrder]);

  const deletePage = useCallback(() => {
    if (pageOrder.length <= 1) return;

    const idx = pageOrder.indexOf(activePageId);
    const nextId = pageOrder[idx - 1] ?? pageOrder[idx + 1] ?? pageOrder[0];
    if (!nextId || nextId === activePageId) return;

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
    setEditingItemId(null);
    setCanvasItems(pagesById[nextId] ?? []);
    setActivePageId(nextId);
  }, [activePageId, canvasItems, pageOrder, pagesById]);

  const renamePage = useCallback(
    (newName: string, pageId?: string) => {
      const id = pageId ?? activePageId;
      const clean = (newName ?? "").trim();
      if (!clean) return;

      setPageNamesById((prev) => ({ ...prev, [id]: clean }));
    },
    [activePageId]
  );

  const movePage = useCallback((pageId: string, delta: -1 | 1) => {
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
  }, []);

  return {
    canvasItems,
    setCanvasItems,
    selectedId,
    setSelectedId,
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
    switchPage,
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
    movePage,
  };
}
