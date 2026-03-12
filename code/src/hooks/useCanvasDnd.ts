import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import type { CanvasItem } from "@/lib/utils";
import { TOOL_DEFINITIONS } from "@/config/tools";
import { parseElection } from "@/utils/parseElectionData";
import data from "@/data/Election207.json";

interface UseCanvasDndArgs {
  canvasItems: CanvasItem[];
  setCanvasItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
  setSelectedId: (id: string | null) => void;
}

export function useCanvasDnd({
  canvasItems,
  setCanvasItems,
  setSelectedId,
}: UseCanvasDndArgs) {

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      const activeId = String(active.id);
      const existingItem = canvasItems.find(i => i.id === activeId);
      const canvasRect = document.getElementById("page")?.getBoundingClientRect();
      const translated = active.rect.current.translated;
      if (!translated) return;

      // --- MOVE EXISTING ITEM ---
      const { delta } = event;

      if (existingItem) {
        // If it was basically a click, don't update position
        if (!delta || (delta.x === 0 && delta.y === 0)) {
          setSelectedId(existingItem.id);
          return;
        }

        const canvasRect = document.getElementById("page")?.getBoundingClientRect();
        if (!canvasRect) return;

        setCanvasItems(prev =>
          prev.map(item => {
            if (item.id !== activeId) return item;

            const newX = item.x + delta.x;
            const newY = item.y + delta.y;

            return {
              ...item,
              x: Math.max(0, Math.min(newX, canvasRect.width - (item.width ?? 0))),
              y: Math.max(0, Math.min(newY, canvasRect.height - (item.height ?? 0))),
            };
          })
        );

        setSelectedId(existingItem.id);
        return;
      }


      if (canvasRect) {
        // Cursor absolute position
        const pointerX = translated.left;
        const pointerY = translated.top;

        // Check if the pointer is actually inside the canvas bounds
        const insideCanvas =
            pointerX >= canvasRect.left &&
            pointerX <= canvasRect.right &&
            pointerY >= canvasRect.top &&
            pointerY <= canvasRect.bottom;

        // If not inside canvas, do nothing
        if (!insideCanvas) {
            return;
        }

        // Only handle drops on the canvas area
        if (over && over.id === "canvas") {
            const toolId = activeId;
            const toolDef = TOOL_DEFINITIONS.find(t => t.id === toolId);
            if (!toolDef) return;

            if (toolId === "question-answer") {
              const { questions, answers } = parseElection(data);
              const newItems: CanvasItem[] = [];
              let currentY = translated.top - canvasRect.top;
              const startX = translated.left - canvasRect.left;

              // Iterate through questions
              Object.keys(questions).forEach((qId) => {
                  const idNum = Number(qId);
                  const questionData = questions[idNum];
                  
                  // 1. Create Question Item
                  const qItem: CanvasItem = {
                      id: `question-${idNum}-${Date.now()}`,
                      type: "text",
                      content: questionData.text,
                      x: startX,
                      y: currentY,
                      width: 400,
                      height: 30,
                      styles: { fontWeight: "bold", fontSize: "16px" },
                      flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 999 }
                  };
                  newItems.push(qItem);
                  currentY += 35; // Offset for the next line

                  // 2. Create Answer Items for this question
                  const questionAnswers = answers[idNum] || [];
                  questionAnswers.forEach((ansText, index) => {
                      const aItem: CanvasItem = {
                          id: `answer-${idNum}-${index}-${Date.now()}`,
                          type: "text",
                          content: `[ ] ${ansText}`, // Adding a simple checkbox visual
                          x: startX + 20, // Indent answers
                          y: currentY,
                          width: 300,
                          height: 25,
                          styles: { fontSize: "14px" },
                          flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 999 }
                      };
                      newItems.push(aItem);
                      currentY += 28; // Stack answers vertically
                  });
                  
                  currentY += 20; // Extra spacing between different questions
              });

              setCanvasItems(items => [...items, ...newItems]);
              return; // Exit early since we handled the burst logic
            }

            const newId = `${toolDef.id}-${Date.now()}`;

            const rawX = translated.left - canvasRect.left;
            const rawY = translated.top - canvasRect.top;

            const x = Math.max(0, Math.min(rawX, canvasRect.width - toolDef.defaultWidth));
            const y = Math.max(0, Math.min(rawY, canvasRect.height - toolDef.defaultHeight));

            const newItem: CanvasItem = {
            id: newId,
            type: toolDef.type,
            content: toolDef.type === "text" ? toolDef.defaultContent : toolDef.imageSrc,
            x,
            y,
            width: toolDef.defaultWidth,
            height: toolDef.defaultHeight,
            flags: { ...toolDef.flags },
            styles: toolDef.styles ?? {},
            };

            setCanvasItems(items => [...items, newItem]);
            setSelectedId(newId);
        }
      }
    },
    [canvasItems, setCanvasItems, setSelectedId]
  );

  return handleDragEnd;
}
