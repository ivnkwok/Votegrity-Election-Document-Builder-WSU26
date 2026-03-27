import type { CanvasItem } from "@/lib/utils";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

interface PropertiesPanelProps {
  item: CanvasItem | undefined;
  onChange: (id: string, updates: Partial<CanvasItem>) => void;
}

interface CommitNumberInputProps {
  value: number;
  disabled?: boolean;
  className: string;
  onCommit: (value: number) => void;
}

function CommitNumberInput({ value, disabled, className, onCommit }: CommitNumberInputProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const normalized = draft.trim();
    if (
      normalized === "" ||
      normalized === "-" ||
      normalized === "." ||
      normalized === "-."
    ) {
      setDraft(String(value));
      return;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }

    onCommit(parsed);
    setDraft(String(parsed));
  };

  return (
    <input
      type="number"
      className={className}
      disabled={disabled}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          setDraft(String(value));
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export function PropertiesPanel({ item, onChange }: PropertiesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!item) return null;

  const isMoveable = item.flags?.isMovable !== false;
  const isText = item.type === "text";
  const isRichTextArea = isText && item.sourceToolId === "text-area";
  const styles = item.styles || {};
  const parsedFontSize = Number.parseInt(String(styles.fontSize ?? "16"), 10);
  const fontSize = Number.isFinite(parsedFontSize) ? parsedFontSize : 16;

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(item.id, { content: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

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
            onChange={(e) =>
              onChange(item.id, { id: e.target.value })
            }
          />
        </div>

        <div><strong>Type:</strong> {item.type}</div>

          {/* Content */}
          <div>
            <strong className="block mb-1 text-wrap">Content:</strong>

            {item.type === "image" ? (
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
                >
                  Upload Image
                </button>

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
            ) : isRichTextArea ? (
              <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                Double-click this text area on the canvas to edit rich text.
              </div>
            ) : (
              <textarea
                className="w-full border rounded px-2 py-1 mt-1"
                value={item.content || ""}
                onChange={(e) =>
                  onChange(item.id, { content: e.target.value })
                }
              />
            )}
          </div>
        {/* TEXT STYLING */}
        {isText && (
          <div className="pt-2 border-t space-y-3">
            <strong>Text Style</strong>
            {isRichTextArea && (
              <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-600">
                These style controls apply to the entire text area.
              </div>
            )}

            {/* Font Size */}
            <div>
              <label className="font-medium">Font Size</label>
              <CommitNumberInput
                className="w-full border rounded px-2 py-1 mt-1"
                value={fontSize}
                onCommit={(value) =>
                  onChange(item.id, {
                    styles: { ...styles, fontSize: `${value}px` },
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
                onChange={(e) =>
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
                onChange={(e) =>
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
              <CommitNumberInput
                className="w-20 border rounded px-1 py-0.5"
                value={item.x}
                disabled={!isMoveable}
                onCommit={(value) => onChange(item.id, { x: value })}
              />
            </label>

            <label className="flex items-center gap-1">
              Y
              <CommitNumberInput
                className="w-20 border rounded px-1 py-0.5"
                value={item.y}
                disabled={!isMoveable}
                onCommit={(value) => onChange(item.id, { y: value })}
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
              <CommitNumberInput
                className="w-20 border rounded px-1 py-0.5"
                value={item.width ?? 200}
                onCommit={(value) => onChange(item.id, { width: value })}
              />
            </label>

            <label className="flex items-center gap-1">
              H
              <CommitNumberInput
                className="w-20 border rounded px-1 py-0.5"
                value={item.height ?? 40}
                onCommit={(value) => onChange(item.id, { height: value })}
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
