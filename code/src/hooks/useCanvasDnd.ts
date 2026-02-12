import { useCallback } from "react";
import type { CanvasItem } from "@/lib/utils";
import { TOOL_DEFINITIONS } from "@/config/tools";

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
    (event: any) => {
      const { active, over } = event;

      const existingItem = canvasItems.find(i => i.id === active.id);
      const canvasRect = document.getElementById("page")?.getBoundingClientRect();
      const translated = active.rect.current.translated;

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
            if (item.id !== active.id) return item;

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
            const toolId = active.id;
            const toolDef = TOOL_DEFINITIONS.find(t => t.id === toolId);
            if (!toolDef) return;

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
