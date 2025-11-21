import { Droppable } from "@/components/Droppable";
import type { CanvasItem } from "@/lib/utils";

interface CanvasProps {
  canvasItems: CanvasItem[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export function Canvas({ canvasItems, selectedId, setSelectedId }: CanvasProps) {
  return (
    <Droppable id="canvas">
      <div
        id="page"
        className="mx-auto bg-white rounded-md shadow-xl print:shadow-none h-screen"
        style={{
          width: "8.5in",
          height: "11in",
          position: "relative",
        }}
        onClick={() => setSelectedId(null)}
      >
        {canvasItems.map((item) => (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(item.id);
            }}
            style={{
              position: "absolute",
              left: `${item.x}px`,
              top: `${item.y}px`,
              border: item.id === selectedId ? "2px solid blue" : "1px dashed #ccc",
              padding: "4px",
              cursor: "pointer",
              backgroundColor: "white",
              width: item.width,
              height: item.height,
              whiteSpace: "pre-wrap",
            }}
          >
            {item.type === "image" ? (
              <img
                src={item.content}
                alt="Votegrity Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              item.content
            )}
          </div>
        ))}
      </div>
    </Droppable>
  );
}
