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
      if (existingItem && canvasRect) {
        setCanvasItems(prev =>
          prev.map(item => {
            if (item.id !== active.id) return item;

            const newX = translated.left - canvasRect.left;
            const newY = translated.top - canvasRect.top;

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

      // --- ADD NEW TOOL ---
      if (over && over.id === "canvas" && canvasRect) {
        const toolId = active.id;
        const toolDef = TOOL_DEFINITIONS.find(t => t.id === toolId);
        if (!toolDef) return;

        const newId = `${toolDef.id}-${Date.now()}`;
        const x = translated.left - canvasRect.left;
        const y = translated.top - canvasRect.top;

        const newItem: CanvasItem = {
          id: newId,
          type: toolDef.type,
          content: toolDef.type === "text" ? toolDef.defaultContent : toolDef.imageSrc,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: toolDef.defaultWidth,
          height: toolDef.defaultHeight,
          flags: { ...toolDef.flags },
          styles: toolDef.styles ?? {},
        };

        setCanvasItems(items => [...items, newItem]);
        setSelectedId(newId);
      }
    },
    [canvasItems, setCanvasItems, setSelectedId]
  );

  return handleDragEnd;
}
