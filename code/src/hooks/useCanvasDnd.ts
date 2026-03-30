import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import type { CanvasItem } from "@/lib/utils";
import { TOOL_DEFINITIONS } from "@/config/tools";
import { parseElection, type RawQuestion } from "@/utils/parseElectionData";
import { createQuestionAnswerItems, createToolDropItem } from "./canvasDnd/itemFactories";
import { clampToRange, isPointInsideRect } from "./canvasDnd/positionUtils";

interface UseCanvasDndArgs {
  canvasItems: CanvasItem[];
  electionData: RawQuestion[];
  selectedIds: Set<string>;
  setCanvasItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectOne: (id: string | null) => void;
  toggleSelect: (id: string) => void;
}

export function useCanvasDnd({
  canvasItems,
  electionData,
  selectedIds,
  setCanvasItems,
  setSelectedIds,
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
        if (!delta || (delta.x === 0 && delta.y === 0)) {
          const { shift, meta } = active.data.current?.getModifiers?.() ?? {};
          if (shift || meta) {
            toggleSelect(existingItem.id);
          } else {
            selectOne(existingItem.id);
          }
          return;
        }

        const idsToMove: Set<string> = selectedIds.has(activeId)
          ? selectedIds
          : new Set([activeId]);

        setCanvasItems((prev) =>
          prev.map((item) => {
            if (!idsToMove.has(item.id)) return item;

            const newX = item.x + delta.x;
            const newY = item.y + delta.y;

            return {
              ...item,
              x: clampToRange(newX, 0, canvasRect.width - (item.width ?? 0)),
              y: clampToRange(newY, 0, canvasRect.height - (item.height ?? 0)),
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

      if (toolId === "question-answer") {
        const { questions, answers } = parseElection(electionData);
        const newItems = createQuestionAnswerItems({
          questions,
          answers,
          startX: translated.left - canvasRect.left,
          startY: translated.top - canvasRect.top,
        });

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

      setCanvasItems((items) => [...items, newItem]);
      selectOne(newItem.id);
    },
    [canvasItems, electionData, selectOne, selectedIds, setCanvasItems, setSelectedIds, toggleSelect]
  );

  return handleDragEnd;
}
