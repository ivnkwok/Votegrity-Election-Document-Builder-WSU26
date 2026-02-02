import type { CanvasItem } from "@/lib/utils";

interface PropertiesPanelProps {
  item: CanvasItem | undefined;
  onChange: (id: string, updates: Partial<CanvasItem>) => void;
}

export function PropertiesPanel({ item, onChange }: PropertiesPanelProps) {
  if (!item) return null;

  const isMoveable = item.flags?.isMoveable !== false;

  return (
    <div className="mt-4 p-4 border rounded-md bg-white shadow">
      <h3 className="font-semibold mb-2">Selected Component</h3>

      <div className="text-sm space-y-3">

        {/* ID (EDITABLE) */}
        <div>
          <label className="font-medium">ID</label>
          <input
            className="w-full border rounded px-2 py-1 mt-1"
            value={item.id}
            onChange={e =>
              onChange(item.id, { id: e.target.value })
            }
          />
        </div>

        <div><strong>Type:</strong> {item.type}</div>

        {/* Content */}
        <div>
          <strong>Content:</strong> {item.content}
        </div>

        {/* POSITION */}
        <div>
          <strong>Position</strong>
          <div className="flex gap-2 mt-1">
            <label className="flex items-center gap-1">
              X
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={item.x}
                disabled={!isMoveable}
                onChange={e =>
                  onChange(item.id, { x: Number(e.target.value) })
                }
              />
            </label>

            <label className="flex items-center gap-1">
              Y
              <input
                type="number"
                className="w-20 border rounded px-1 py-0.5"
                value={item.y}
                disabled={!isMoveable}
                onChange={e =>
                  onChange(item.id, { y: Number(e.target.value) })
                }
              />
            </label>
          </div>
        </div>

        {/* Size */}
        <div>
          <strong>Size:</strong> {item.width ?? 200} × {item.height ?? 40}
        </div>

        {/* Flags */}
        <div><strong>Moveable:</strong> {isMoveable ? "Yes" : "No"}</div>
        <div><strong>Editable:</strong> {item.flags?.isEditable ? "Yes" : "No"}</div>
        <div><strong>Min Qty:</strong> {item.flags?.minQuantity ?? "-"}</div>
        <div><strong>Max Qty:</strong> {item.flags?.maxQuantity ?? "-"}</div>

      </div>
    </div>
  );
}
