import { Droppable } from "@/components/Droppable";
import { Draggable } from "@/components/Draggable";
import type { CanvasItem } from "@/lib/utils";
import { CanvasItemRenderer } from "./CanvasItemRenderer";

interface CanvasProps {
  canvasItems: CanvasItem[];
  selectedId: string | null;
  editingItemId: string | null;
  setSelectedId: (id: string | null) => void;
  setEditingItemId: (id: string | null) => void;
  onChangeItem: (id: string, updates: Partial<CanvasItem>) => void;
}

function isRichTextArea(item: CanvasItem): boolean {
  return item.type === "text" && item.sourceToolId === "text-area";
}

// Renders the main canvas area where items are displayed and can be selected.
export function Canvas({
  canvasItems,
  selectedId,
  editingItemId,
  setSelectedId,
  setEditingItemId,
  onChangeItem,
}: CanvasProps) {
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
        onClick={() => {
          setSelectedId(null);
          setEditingItemId(null);
        }}
      >
        {canvasItems.map((item) => {
          const richTextArea = isRichTextArea(item);
          const isEditing = editingItemId === item.id;

          return (
            <Draggable
              key={item.id}
              id={item.id}
              disabled={isEditing}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(item.id);
                if (editingItemId && editingItemId !== item.id) {
                  setEditingItemId(null);
                }
              }}
              onDoubleClick={(e) => {
                if (!richTextArea) return;
                e.stopPropagation();
                setSelectedId(item.id);
                setEditingItemId(item.id);
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
                cursor: isEditing ? "text" : "grab",
                backgroundColor: "white",
                zIndex: item.id === selectedId ? 50 : 1,
              }}
            >
              <CanvasItemRenderer
                item={item}
                isEditing={isEditing}
                onChangeItem={onChangeItem}
                onExitEditMode={() => setEditingItemId(null)}
              />
            </Draggable>
          );
        })}
      </div>
    </Droppable>
  );
}
