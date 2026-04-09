import { Droppable } from "@/components/Droppable";
import { Draggable } from "@/components/Draggable";
import type { CanvasItem } from "@/lib/utils";
import type { DragSession } from "@/hooks/canvasDnd/dragGroup";
import { CanvasItemRenderer } from "./CanvasItemRenderer";

interface CanvasProps {
  canvasItems: CanvasItem[];
  selectedId: string | null;
  selectedIds: Set<string>;
  dragSession: DragSession;
  editingItemId: string | null;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onClearSelection: () => void;
  onBeginEdit: (id: string) => void;
  onExitEdit: () => void;
  onChangeItem: (id: string, updates: Partial<CanvasItem>) => void;
}

function isRichTextArea(item: CanvasItem): boolean {
  return item.type === "text" && item.sourceToolId === "text-area";
}

// Renders the main canvas area where items are displayed and can be selected.
export function Canvas({
  canvasItems,
  selectedId,
  selectedIds,
  dragSession,
  editingItemId,
  onSelect,
  onClearSelection,
  onBeginEdit,
  onExitEdit,
  onChangeItem,
}: CanvasProps) {
  const isDragging = dragSession.activeId !== null;

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
        onClick={onClearSelection}
      >
        {canvasItems.map((item) => {
          const richTextArea = isRichTextArea(item);
          const isEditing = editingItemId === item.id;
          const isMovable = item.flags?.isMovable !== false;
          const isSelected = selectedIds.has(item.id) || item.id === selectedId;
          const isInDragGroup = isDragging && dragSession.moveIds.has(item.id);
          const isActiveDragItem = dragSession.activeId === item.id;
          const activeTransform = isActiveDragItem
            ? `translate3d(${dragSession.appliedDelta.x}px, ${dragSession.appliedDelta.y}px, 0)`
            : undefined;
          const showPreviewTransform =
            isInDragGroup &&
            !isActiveDragItem &&
            (dragSession.appliedDelta.x !== 0 || dragSession.appliedDelta.y !== 0);
          const previewTransform = showPreviewTransform
            ? `translate3d(${dragSession.appliedDelta.x}px, ${dragSession.appliedDelta.y}px, 0)`
            : undefined;

          return (
            <Draggable
              key={item.id}
              id={item.id}
              disabled={isEditing || !isMovable}
              useDragTransform={false}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id, e);
              }}
              onPointerDown={(e) => {
                if (isEditing) return;
                if (e.shiftKey || e.metaKey || e.ctrlKey) {
                  // Prevent browser range-selection behavior during multi-select modifier clicks.
                  e.preventDefault();
                }
              }}
              onDoubleClick={(e) => {
                if (!richTextArea) return;
                e.stopPropagation();
                onBeginEdit(item.id);
              }}
              style={{
                boxSizing: "border-box",
                position: "absolute",
                left: `${item.x}px`,
                top: `${item.y}px`,
                width: item.width,
                height: item.height,
                outline: isSelected ? "2px dashed #ccc" : "2px solid transparent",
                padding: "4px",
                cursor: isEditing ? "text" : isInDragGroup ? "grabbing" : isMovable ? "grab" : "default",
                backgroundColor: "white",
                transform: activeTransform ?? previewTransform,
                zIndex: isInDragGroup ? 80 : isSelected ? 50 : 1,
              }}
            >
              <CanvasItemRenderer
                item={item}
                isEditing={isEditing}
                onChangeItem={onChangeItem}
                onExitEditMode={onExitEdit}
              />
            </Draggable>
          );
        })}
      </div>
    </Droppable>
  );
}
