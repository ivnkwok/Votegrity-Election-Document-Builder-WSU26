import { Droppable } from "@/components/Droppable";
import { Draggable } from "@/components/Draggable";
import type { CanvasItem } from "@/lib/utils";
import { CanvasItemRenderer } from "./CanvasItemRenderer";

interface CanvasProps {
  canvasItems: CanvasItem[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

// Renders the main canvas area where items are displayed and can be selected.
export function Canvas({ canvasItems, selectedId, setSelectedId }: CanvasProps) {
  return (
    <Droppable id="canvas">
      <div
        id="page"
        className="mx-auto bg-white shadow-lg rounded-md border border-gray-300"
        style={{
          width: "8.5in",
          height: "11in",
          position: "relative",
        }}
        onClick={() => setSelectedId(null)}
      >
        {canvasItems.map((item) => (
          <Draggable
            key={item.id}
            id={item.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(item.id);
            }}
            style={{
              boxSizing: "border-box",
              position: "absolute",
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: item.width,
              height: item.height,
              outline: item.id === selectedId ? "2px dashed #ccc" : "2px solid transparent",
              padding: "4px",
              cursor: "grab",
              backgroundColor: "white",
              zIndex: item.id === selectedId ? 50 : 1,
            }}
          >
            <CanvasItemRenderer item={item} />
          </Draggable>
        ))}
      </div>
    </Droppable>
  );
}