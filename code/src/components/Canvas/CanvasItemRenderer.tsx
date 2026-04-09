import type { CanvasItem } from "@/lib/utils";

import { CanvasBoxItem } from "./items/CanvasBoxItem";
import { CanvasImageItem } from "./items/CanvasImageItem";
import { CanvasTextItem } from "./items/CanvasTextItem";

interface CanvasItemRendererProps {
  item: CanvasItem;
  isEditing: boolean;
  onChangeItem: (id: string, updates: Partial<CanvasItem>) => void;
  onExitEditMode: () => void;
}

/*
Renders the appropriate CanvasItem based on its type.

Can be expanded in the future to support additional item types.

Just a simple switch statement with specific renderers for each type.
*/
export function CanvasItemRenderer({
  item,
  isEditing,
  onChangeItem,
  onExitEditMode,
}: CanvasItemRendererProps) {
  switch (item.type) {
    case "box":
      return <CanvasBoxItem item={item} />;

    case "image":
      return <CanvasImageItem item={item} />;

    case "text":
      return (
        <CanvasTextItem
          item={item}
          isEditing={isEditing}
          onChangeItem={onChangeItem}
          onExitEditMode={onExitEditMode}
        />
      );

    default:
      return null;
  }
}
