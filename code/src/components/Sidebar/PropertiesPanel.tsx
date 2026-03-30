import type { CanvasItem } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ContentSection } from "./properties/ContentSection";
import { FlagsSummarySection } from "./properties/FlagsSummarySection";
import { PositionSizeSection } from "./properties/PositionSizeSection";
import { TextStyleSection } from "./properties/TextStyleSection";

interface PropertiesPanelProps {
  item: CanvasItem | undefined;
  onChange: (id: string, updates: Partial<CanvasItem>) => void;
}

export function PropertiesPanel({ item, onChange }: PropertiesPanelProps) {
  if (!item) return null;

  const isMoveable = item.flags?.isMovable !== false;
  const isText = item.type === "text";
  const isRichTextArea = isText && item.sourceToolId === "text-area";

  return (
    <div className="mt-4 rounded-md border bg-white p-4 shadow">
      <h3 className="mb-2 font-semibold">Selected Component</h3>

      <div className="space-y-3 text-sm">
        <div>
          <label className="font-medium">ID</label>
          <Input className="mt-1" value={item.id} onChange={(e) => onChange(item.id, { id: e.target.value })} />
        </div>

        <div>
          <strong>Type:</strong> {item.type}
        </div>

        <ContentSection item={item} onChange={onChange} isRichTextArea={isRichTextArea} />

        <TextStyleSection item={item} onChange={onChange} isRichTextArea={isRichTextArea} />

        <PositionSizeSection item={item} onChange={onChange} isMoveable={isMoveable} />

        <FlagsSummarySection item={item} />
      </div>
    </div>
  );
}
