import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import type { CanvasItem } from "@/lib/utils";
import { TOOL_DEFINITIONS } from "@/config/tools";
import { parseElection, type RawQuestion } from "@/utils/parseElectionData";
import { createQuestionAnswerItems, createToolDropItem } from "./canvasDnd/itemFactories";
import { isPointInsideRect } from "./canvasDnd/positionUtils";
import {
  computeRigidClampedDelta,
  getMoveItems,
  resolveDragMoveIds,
  type DragSession,
} from "./canvasDnd/dragGroup";

interface UseCanvasDndArgs {
  canvasItems: CanvasItem[];
  electionData: RawQuestion[];
  selectedIds: Set<string>;
  dragSession: DragSession;
  setCanvasItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setToolStatusMessage: React.Dispatch<React.SetStateAction<string | null>>;
  selectOne: (id: string | null) => void;
  toggleSelect: (id: string) => void;
}

export function useCanvasDnd({
  canvasItems,
  electionData,
  selectedIds,
  dragSession,
  setCanvasItems,
  setSelectedIds,
  setToolStatusMessage,
  selectOne,
  toggleSelect,
}: UseCanvasDndArgs) {
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;
      const translated = active.rect.current.translated;
      if (!translated) return;

      const activeId = String(active.id);
      const existingItem = canvasItems.find((item) => item.id === activeId);

      const canvasRect = document.getElementById("page")?.getBoundingClientRect();
      if (!canvasRect) return;

      if (existingItem) {
        const rawDelta = delta ?? { x: 0, y: 0 };
        const hasLiveSession =
          dragSession.activeId === activeId && dragSession.moveIds.size > 0;
        const sessionRawDelta = hasLiveSession ? dragSession.rawDelta : rawDelta;

        if (sessionRawDelta.x === 0 && sessionRawDelta.y === 0) {
          const { shift, meta } = active.data.current?.getModifiers?.() ?? {};
          if (shift || meta) {
            toggleSelect(existingItem.id);
          } else {
            selectOne(existingItem.id);
          }
          return;
        }

        const fallbackMoveIds = resolveDragMoveIds({
          activeId,
          selectedIds,
          canvasItems,
        });

        const idsToMove =
          hasLiveSession
            ? dragSession.moveIds
            : fallbackMoveIds;
        const moveItems = getMoveItems(canvasItems, idsToMove);
        const appliedDelta = hasLiveSession
          ? dragSession.appliedDelta
          : computeRigidClampedDelta(rawDelta, moveItems, canvasRect);

        setCanvasItems((prev) =>
          prev.map((item) => {
            if (!idsToMove.has(item.id)) return item;

            return {
              ...item,
              x: item.x + appliedDelta.x,
              y: item.y + appliedDelta.y,
            };
          })
        );

        if (!selectedIds.has(activeId)) {
          selectOne(existingItem.id);
        }
        return;
      }

      const pointerX = translated.left;
      const pointerY = translated.top;

      if (!isPointInsideRect(pointerX, pointerY, canvasRect)) {
        return;
      }

      if (!over || over.id !== "canvas") {
        return;
      }

      const toolId = activeId;
      const toolDef = TOOL_DEFINITIONS.find((tool) => tool.id === toolId);
      if (!toolDef) return;

      const existingCount = canvasItems.filter((item) => item.sourceToolId === toolDef.id).length;
      if (existingCount >= toolDef.flags.maxQuantity) {
        const limitMessage = toolDef.flags.maxQuantity === 1
          ? `"${toolDef.label}" can only be added once on this page.`
          : `"${toolDef.label}" can only be added ${toolDef.flags.maxQuantity} times on this page.`;
        setToolStatusMessage(limitMessage);
        return;
      }

      if ((toolDef.toolKind ?? "canvas-item") === "generator" && toolId === "question-answer") {
        if (electionData.length === 0) {
          setToolStatusMessage("Select an election with questions before adding Q&A.");
          return;
        }

        const questionEntries = parseElection(electionData);
        const newItems = createQuestionAnswerItems({
          questionEntries,
          startX: translated.left - canvasRect.left,
          startY: translated.top - canvasRect.top,
        });

        setToolStatusMessage(null);
        setCanvasItems((items) => [...items, ...newItems]);
        setSelectedIds(new Set(newItems.map((item) => item.id)));
        return;
      }

      const newItem = createToolDropItem({
        toolDef,
        translatedLeft: translated.left,
        translatedTop: translated.top,
        canvasRect,
      });

      setToolStatusMessage(null);
      setCanvasItems((items) => [...items, newItem]);
      selectOne(newItem.id);
    },
    [
      canvasItems,
      dragSession,
      electionData,
      selectOne,
      selectedIds,
      setCanvasItems,
      setSelectedIds,
      setToolStatusMessage,
      toggleSelect,
    ]
  );

  return handleDragEnd;
}
