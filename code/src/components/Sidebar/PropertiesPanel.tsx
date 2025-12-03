import type { CanvasItem } from "@/lib/utils";

interface PropertiesPanelProps {
  item: CanvasItem | undefined;
}

export function PropertiesPanel({ item }: PropertiesPanelProps) {
  if (!item) return null;

  return (
    <div className="mt-4 p-4 border rounded-md bg-white shadow">
      <h3 className="font-semibold mb-2">Selected Component</h3>

      <div className="text-sm space-y-2">
        <div><strong>ID:</strong> {item.id}</div>
        <div><strong>Type:</strong> {item.type}</div>
        <div><strong>Content:</strong> {item.content}</div>
        <div><strong>Position:</strong> x = {item.x}, y = {item.y}</div>
        <div><strong>Size:</strong> {item.width ?? 200} × {item.height ?? 40}</div>
        <div><strong>Moveable:</strong> {item.flags?.isMoveable ? "Yes" : "No"}</div>
        <div><strong>Editable:</strong> {item.flags?.isEditable ? "Yes" : "No"}</div>
        <div><strong>Min Qty:</strong> {item.flags?.minQuantity}</div>
        <div><strong>Max Qty:</strong> {item.flags?.maxQuantity}</div>
      </div>
    </div>
  );
}
