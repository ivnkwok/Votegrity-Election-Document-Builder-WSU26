import { useCallback, useEffect, useState } from "react";
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import type { CanvasItem } from "@/lib/utils";
import {
  saveDocumentLayout,
  loadDocumentLayout,
  type LoadedDocument,
} from "@/services/layoutService";
import { mergeCanvasItemUpdates } from "@/lib/canvasBounds";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { useCanvasDnd } from "./useCanvasDnd";
import type { RawQuestion } from "@/utils/parseElectionData";
import { buildImportedPdfPages } from "./appController/pageUtils";
import { usePageState } from "./appController/usePageState";
import {
  applyVoterMergeToItems,
  documentContainsMailMergeTools,
  parseVoterData,
  type VoterValidationIssue,
} from "@/services/mailMergeService";
import {
  computeRigidClampedDelta,
  createEmptyDragSession,
  getMoveItems,
  resolveDragMoveIds,
  type DragSession,
} from "./canvasDnd/dragGroup";
import { exportCanvasPagesToPdf } from "@/services/documentPdfService";

interface UseAppControllerArgs {
  electionData: RawQuestion[];
}

const MAX_ISSUE_LINES = 10;

function sanitizeFilenameSegment(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "voters";
}

function summarizeIssues(issues: VoterValidationIssue[]): string {
  if (issues.length === 0) return "";

  const lines = issues.slice(0, MAX_ISSUE_LINES).map((issue) => {
    if (issue.rowIndex <= 0) {
      return `- ${issue.message}`;
    }
    return `- Row ${issue.rowIndex}: ${issue.message}`;
  });

  const overflow = issues.length - lines.length;
  if (overflow > 0) {
    lines.push(`- ...and ${overflow} more issue(s).`);
  }

  return lines.join("\n");
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
  const [dragSession, setDragSession] = useState<DragSession>(createEmptyDragSession);
  const [isMailMerging, setIsMailMerging] = useState(false);
  const [toolStatusMessage, setToolStatusMessage] = useState<string | null>(null);

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
    setToolStatusMessage(null);
  }, [switchPageBase]);

  const addPage = useCallback(() => {
    addPageBase();
    setSelectedIdsState(new Set());
    setToolStatusMessage(null);
  }, [addPageBase]);

  const duplicatePage = useCallback(() => {
    duplicatePageBase();
    setSelectedIdsState(new Set());
    setToolStatusMessage(null);
  }, [duplicatePageBase]);

  const deletePage = useCallback(() => {
    deletePageBase();
    setSelectedIdsState(new Set());
    setToolStatusMessage(null);
  }, [deletePageBase]);

  useEffect(() => {
    if (!editingItemId) return;
    if (selectedId === editingItemId) return;
    setEditingItemId(null);
  }, [editingItemId, selectedId, setEditingItemId]);

  useKeyboardMovement(selectedIdsState, editingItemId, setCanvasItems);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const moveIds = resolveDragMoveIds({
      activeId,
      selectedIds: selectedIdsState,
      canvasItems,
    });

    setDragSession({
      activeId,
      rawDelta: { x: 0, y: 0 },
      appliedDelta: { x: 0, y: 0 },
      moveIds,
    });
  }, [canvasItems, selectedIdsState]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const activeId = String(event.active.id);
    const rawDelta = event.delta ?? { x: 0, y: 0 };
    const canvasRect = document.getElementById("page")?.getBoundingClientRect();

    setDragSession((prev) => {
      const moveIds =
        prev.activeId === activeId && prev.moveIds.size > 0
          ? prev.moveIds
          : resolveDragMoveIds({
            activeId,
            selectedIds: selectedIdsState,
            canvasItems,
          });

      const moveItems = getMoveItems(canvasItems, moveIds);
      const appliedDelta =
        canvasRect && moveItems.length > 0
          ? computeRigidClampedDelta(rawDelta, moveItems, canvasRect)
          : { x: 0, y: 0 };

      return {
        activeId,
        rawDelta,
        appliedDelta,
        moveIds,
      };
    });
  }, [canvasItems, selectedIdsState]);

  const handleDragCancel = useCallback(() => {
    setDragSession(createEmptyDragSession());
  }, []);

  const loadDocument = useCallback((doc: LoadedDocument) => {
    setPageOrder(doc.pageOrder);
    setPageNamesById(doc.pageNamesById);
    setPagesById(doc.pagesById);
    setToolStatusMessage(null);

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
    } finally {
      e.target.value = "";
    }
  }, [loadDocument]);

  const handlePreviewPDF = useCallback(async () => {
    const docPagesById: Record<string, CanvasItem[]> = {
      ...pagesById,
      [activePageId]: canvasItems,
    };

    try {
      await exportCanvasPagesToPdf({
        pages: pageOrder.map((pageId) => docPagesById[pageId] ?? []),
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error generating preview PDF.";
      alert(message);
    }
  }, [activePageId, canvasItems, pageOrder, pagesById]);

  const handleMailMergePDF = useCallback(async (
    rawVoterData: unknown,
    options?: { sourceLabel?: string }
  ) => {
    if (isMailMerging) return;
    if (rawVoterData === null || rawVoterData === undefined) {
      alert("No voter data is loaded for mail merge.");
      return;
    }

    const docPagesById: Record<string, CanvasItem[]> = {
      ...pagesById,
      [activePageId]: canvasItems,
    };

    if (!documentContainsMailMergeTools(pageOrder, docPagesById)) {
      alert("Mail merge requires at least one Voter Address or Voter PIN component on the template.");
      return;
    }

    const parsed = parseVoterData(rawVoterData);
    if (parsed.totalRows === 0) {
      const issueSummary = summarizeIssues(parsed.issues);
      const message = issueSummary
        ? `No voter rows were found.\n${issueSummary}`
        : "No voter rows were found in the selected data.";
      alert(message);
      return;
    }

    if (parsed.validRecords.length === 0) {
      const issueSummary = summarizeIssues(parsed.issues);
      const message = issueSummary
        ? `Mail merge could not start because no valid voter rows were found.\n${issueSummary}`
        : "Mail merge could not start because no valid voter rows were found.";
      alert(message);
      return;
    }

    setIsMailMerging(true);

    try {
      const mergedPages: CanvasItem[][] = [];

      for (const voter of parsed.validRecords) {
        for (const pageId of pageOrder) {
          const templateItems = docPagesById[pageId] ?? [];
          mergedPages.push(applyVoterMergeToItems(templateItems, voter));
        }
      }

      const timestamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
      const sourceSegment = sanitizeFilenameSegment(options?.sourceLabel ?? "voters");
      const filename = `mail-merge-${sourceSegment}-${parsed.validRecords.length}-voters-${timestamp}.pdf`;
      await exportCanvasPagesToPdf({
        pages: mergedPages,
        filename,
      });

      if (parsed.issues.length > 0) {
        alert(
          `Mail merge completed for ${parsed.validRecords.length} voter(s). `
          + `${parsed.issues.length} row(s) were skipped.\n${summarizeIssues(parsed.issues)}`
        );
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error generating mail merge PDF.";
      alert(message);
    } finally {
      setIsMailMerging(false);
    }
  }, [
    activePageId,
    canvasItems,
    isMailMerging,
    pageOrder,
    pagesById,
  ]);

  const commitDragEnd = useCanvasDnd({
    canvasItems,
    electionData,
    selectedIds: selectedIdsState,
    dragSession,
    setCanvasItems,
    setSelectedIds,
    setToolStatusMessage,
    selectOne,
    toggleSelect,
  });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    commitDragEnd(event);
    setDragSession(createEmptyDragSession());
  }, [commitDragEnd]);

  const updateItem = useCallback((id: string, updates: Partial<CanvasItem>) => {
    setCanvasItems((items) =>
      items.map((item) => (item.id === id ? mergeCanvasItemUpdates(item, updates) : item))
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
  }, [editingItemId, setCanvasItems, setEditingItemId, setSelectedIds]);

  const handlePdfImport = useCallback(
    (images: { dataUrl: string; pageNumber: number }[]) => {
      if (images.length === 0) return;

      const { newPageIds, importedPagesById, importedPageNamesById } = buildImportedPdfPages(images);

      setPagesById((prev) => ({
        ...prev,
        [activePageId]: canvasItems,
        ...importedPagesById,
      }));
      setToolStatusMessage(null);
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
    dragSession,
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
    handleMailMergePDF,
    handleDragStart,
    handleDragMove,
    handleDragCancel,
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
    isMailMerging,
    toolStatusMessage,

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
