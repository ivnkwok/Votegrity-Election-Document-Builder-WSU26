import { useEffect } from "react";
import type { CanvasItem } from "@/lib/utils";

// Hook to enable keyboard movement of selected canvas items using arrow keys (pixel nudge).
export function useKeyboardMovement(
  selectedIds: Set<string>,
  editingItemId: string | null,
  setCanvasItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>
) {
  useEffect(() => {
    if (selectedIds.size === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingItemId && selectedIds.has(editingItemId)) return;

      const movement = e.shiftKey ? 10 : 1;

      let dx = 0;
      let dy = 0;
      switch (e.key) {
        case "ArrowUp":
          dy = -movement;
          break;
        case "ArrowDown":
          dy = movement;
          break;
        case "ArrowLeft":
          dx = -movement;
          break;
        case "ArrowRight":
          dx = movement;
          break;
        default:
          return;
      }

      setCanvasItems((prev) =>
        prev.map((item) => {
          if (!selectedIds.has(item.id)) return item;

          return {
            ...item,
            x: Math.max(0, item.x + dx),
            y: Math.max(0, item.y + dy),
          };
        })
      );

      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingItemId, selectedIds, setCanvasItems]);
}
