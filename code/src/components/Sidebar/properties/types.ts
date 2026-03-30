import type { CanvasItem } from "@/lib/utils";

export interface PropertiesSectionProps {
  item: CanvasItem;
  onChange: (id: string, updates: Partial<CanvasItem>) => void;
}
