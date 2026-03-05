import type { CanvasItem } from "@/lib/utils";
import { useRef, type ChangeEvent } from "react";

interface PropertiesPanelProps {
  item: CanvasItem | undefined;
  onChange: (id: string, updates: Partial<CanvasItem>) => void;
}

export function PropertiesPanel({ item, onChange }: PropertiesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!item) return null;

  const isMoveable = item.flags?.isMoveable !== false;
  const isText = item.type === "text";
  const styles = item.styles || {};

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange(item.id, {content: reader.result as string})
      }
      reader.readAsDataURL(file)
    }
  }

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
          <strong className="block mb-1">Content:</strong>
          {item.id.includes("upload-test") ? (
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full hover:bg-gray-200 text-black font-medium py-2 px-4 rounded border border-gray-300"
              >Upload Image</button>
              {item.content && (
                <div className="mt-2">
                  <p className="text-[10px] text-gray-500 mb-1">Preview:</p>
                  <img 
                    src={item.content} 
                    alt="Preview" 
                    className="max-h-20 rounded border" 
                  />
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-600">{item.content || "No content"}</span>
          )}
        </div>
        {/* TEXT STYLING */}
        {isText && (
          <div className="pt-2 border-t space-y-3">
            <strong>Text Style</strong>

            {/* Font Size */}
            <div>
              <label className="font-medium">Font Size</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1 mt-1"
                value={parseInt(styles.fontSize as string) || 16}
                onChange={e =>
                  onChange(item.id, {
                    styles: { ...styles, fontSize: `${e.target.value}px` },
                  })
                }
              />
            </div>

            {/* Color */}
            <div>
              <label className="font-medium">Color</label>
              <input
                type="color"
                className="w-full h-8 mt-1"
                value={(styles.color as string) || "#000000"}
                onChange={e =>
                  onChange(item.id, {
                    styles: { ...styles, color: e.target.value },
                  })
                }
              />
            </div>

            {/* Font Family */}
            <div>
              <label className="font-medium">Font</label>
              <select
                className="w-full border rounded px-2 py-1 mt-1"
                value={(styles.fontFamily as string) || "Arial"}
                onChange={e =>
                  onChange(item.id, {
                    styles: { ...styles, fontFamily: e.target.value },
                  })
                }
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
          </div>
        )}

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
            <strong>Size</strong>
            <div className="flex gap-2 mt-1">
              <label className="flex items-center gap-1">
                W
                <input
                  type="number"
                  className="w-20 border rounded px-1 py-0.5"
                  value={item.width ?? 200}
                  onChange={e =>
                    onChange(item.id, { width: Number(e.target.value) })
                  }
                />
              </label>

              <label className="flex items-center gap-1">
                H
                <input
                  type="number"
                  className="w-20 border rounded px-1 py-0.5"
                  value={item.height ?? 40}
                  onChange={e =>
                    onChange(item.id, { height: Number(e.target.value) })
                  }
                />
              </label>
            </div>
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
