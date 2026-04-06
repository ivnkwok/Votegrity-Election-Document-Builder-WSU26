import { useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import type { PropertiesSectionProps } from "./types";
import { MAIL_MERGE_TOOL_SOURCE_IDS } from "@/services/mailMergeService";

interface ContentSectionProps extends PropertiesSectionProps {
  isRichTextArea: boolean;
}

export function ContentSection({ item, onChange, isRichTextArea }: ContentSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMailMergePlaceholder =
    item.sourceToolId === MAIL_MERGE_TOOL_SOURCE_IDS.voterAddress
    || item.sourceToolId === MAIL_MERGE_TOOL_SOURCE_IDS.voterPin;

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(item.id, { content: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <strong className="mb-1 block text-wrap">Content:</strong>

      {item.type === "image" ? (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            Upload Image
          </Button>

          {item.content && (
            <div className="mt-2">
              <p className="mb-1 text-[10px] text-gray-500">Preview:</p>
              <img src={item.content} alt="Preview" className="max-h-20 rounded border" />
            </div>
          )}
        </div>
      ) : isRichTextArea ? (
        <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Double-click this text area on the canvas to edit rich text.
        </div>
      ) : isMailMergePlaceholder ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This placeholder is filled automatically during mail merge.
        </div>
      ) : (
        <textarea
          className="mt-1 w-full rounded border px-2 py-1"
          value={item.content || ""}
          onChange={(e) => onChange(item.id, { content: e.target.value })}
        />
      )}
    </div>
  );
}
