import { useEffect } from "react";
import type { CanvasItem } from "@/lib/utils";

// Hook to enable keyboard movement of selected canvas items using arrow keys (pixel nudge).
export function useKeyboardMovement(
  selectedId: string | null,
  editingItemId: string | null,
  setCanvasItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>
) {
  useEffect(() => {
    if (!selectedId || editingItemId === selectedId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const movement = e.shiftKey ? 10 : 1;

      let handled = false;

      if (e.key === "ArrowUp") handled = true;
      if (e.key === "ArrowDown") handled = true;
      if (e.key === "ArrowLeft") handled = true;
      if (e.key === "ArrowRight") handled = true;

      if (!handled) return;

      setCanvasItems((prev) =>
        prev.map((item) => {
          if (item.id !== selectedId) return item;

          let x = item.x;
          let y = item.y;

          switch (e.key) {
            case "ArrowUp":
              y -= movement;
              break;
            case "ArrowDown":
              y += movement;
              break;
            case "ArrowLeft":
              x -= movement;
              break;
            case "ArrowRight":
              x += movement;
              break;
          }

          return {
            ...item,
            x: Math.max(0, x),
            y: Math.max(0, y),
          };
        })
      );

      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingItemId, selectedId, setCanvasItems]);
}
