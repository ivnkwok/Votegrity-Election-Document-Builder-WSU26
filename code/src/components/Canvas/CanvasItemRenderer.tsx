import type { CanvasItem } from "@/lib/utils";

import { CanvasTextItem } from "./items/CanvasTextItem";
import { CanvasImageItem } from "./items/CanvasImageItem";

export function CanvasItemRenderer({ item }: { item: CanvasItem }) {
  switch (item.type) {
    case "image":
      return <CanvasImageItem item={item} />;

    case "text":
    default:
      return <CanvasTextItem item={item} />;
  }
}
