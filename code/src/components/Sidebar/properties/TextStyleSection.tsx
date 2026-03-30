import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEXT_FONT_FAMILIES } from "@/lib/textStyleOptions";
import { CommitNumberInput } from "./CommitNumberInput";
import type { PropertiesSectionProps } from "./types";

interface TextStyleSectionProps extends PropertiesSectionProps {
  isRichTextArea: boolean;
}

export function TextStyleSection({ item, onChange, isRichTextArea }: TextStyleSectionProps) {
  if (item.type !== "text") {
    return null;
  }

  const styles = item.styles || {};
  const parsedFontSize = Number.parseInt(String(styles.fontSize ?? "16"), 10);
  const fontSize = Number.isFinite(parsedFontSize) ? parsedFontSize : 16;

  return (
    <div className="space-y-3 border-t pt-2">
      <strong>Text Style</strong>
      {isRichTextArea && (
        <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-600">
          These style controls apply to the entire text area.
        </div>
      )}

      <div>
        <label className="font-medium">Font Size</label>
        <CommitNumberInput
          className="mt-1"
          value={fontSize}
          onCommit={(value) =>
            onChange(item.id, {
              styles: { ...styles, fontSize: `${value}px` },
            })
          }
        />
      </div>

      <div>
        <label className="font-medium">Color</label>
        <input
          type="color"
          className="mt-1 h-8 w-full"
          value={(styles.color as string) || "#000000"}
          onChange={(e) =>
            onChange(item.id, {
              styles: { ...styles, color: e.target.value },
            })
          }
        />
      </div>

      <div>
        <label className="font-medium">Font</label>
        <Select
          value={(styles.fontFamily as string) || "Arial"}
          onValueChange={(value) =>
            onChange(item.id, {
              styles: { ...styles, fontFamily: value },
            })
          }
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select font family" />
          </SelectTrigger>
          <SelectContent>
            {TEXT_FONT_FAMILIES.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
