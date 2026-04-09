import type { CanvasItem } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ContentSection } from "./properties/ContentSection";
import { FlagsSummarySection } from "./properties/FlagsSummarySection";
import { PositionSizeSection } from "./properties/PositionSizeSection";
import { TextStyleSection } from "./properties/TextStyleSection";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PropertiesPanelProps {
  item: CanvasItem | undefined;
  onChange: (id: string, updates: Partial<CanvasItem>) => void;
  onDelete: () => void;
}

export function PropertiesPanel({ item, onChange, onDelete }: PropertiesPanelProps) {
  if (!item) return null;

  const isMovable = item.flags?.isMovable !== false;
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

        <PositionSizeSection item={item} onChange={onChange} isMovable={isMovable} />

        <FlagsSummarySection item={item} />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" title="Delete selected">
              Delete Selected
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete selected component?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
