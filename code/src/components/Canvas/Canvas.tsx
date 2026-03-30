import { Droppable } from "@/components/Droppable";
import { Draggable } from "@/components/Draggable";
import type { CanvasItem } from "@/lib/utils";
import { CanvasItemRenderer } from "./CanvasItemRenderer";
import { useDndMonitor, type Translate } from "@dnd-kit/core";
import { useState } from "react";

interface CanvasProps {
  canvasItems: CanvasItem[];
  selectedId: string | null;
  selectedIds: Set<string>;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onClearSelection: () => void;
  onChangeItem: (id: string, updates: Partial<CanvasItem>) => void;
}

export function Canvas({ canvasItems, selectedId, selectedIds, onSelect, onClearSelection, onChangeItem }: CanvasProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [dragTranslate, setDragTranslate] = useState<Translate | null>(null);

  useDndMonitor({
    onDragStart({ active }) {
      setDragActiveId(String(active.id));
      setDragTranslate(null);
    },
    onDragMove({ delta }) {
      setDragTranslate(delta);
    },
    onDragEnd() {
      setDragActiveId(null);
      setDragTranslate(null);
    },
    onDragCancel() {
      setDragActiveId(null);
      setDragTranslate(null);
    },
  });

  const isDraggingSelection =
    dragActiveId !== null && selectedIds.has(dragActiveId) && dragTranslate !== null;

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
          onClearSelection();
          setEditingId(null);
        }}
      >
        {canvasItems.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const isEditing = editingId === item.id;

          const isGhost = isDraggingSelection && isSelected && item.id !== dragActiveId;
          const ghostStyle: React.CSSProperties = isGhost
            ? { transform: `translate3d(${dragTranslate!.x}px, ${dragTranslate!.y}px, 0)`, zIndex: 100 }
            : {};

          return (
            <Draggable
              key={item.id}
              id={item.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id, e);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingId(item.id);
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
                cursor: isEditing ? "text" : "grab",
                backgroundColor: "white",
                zIndex: isSelected ? 50 : 1,
                ...ghostStyle,
              }}
            >
              <CanvasItemRenderer
                item={item}
                isEditing={isEditing}
                onChangeItem={onChangeItem}
                onExitEditMode={() => setEditingId(null)}
              />
            </Draggable>
          );
        })}
      </div>
    </Droppable>
  );
}