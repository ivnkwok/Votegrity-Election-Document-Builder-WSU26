import type { CanvasItem } from "@/lib/utils";

import { CanvasTextItem } from "./items/CanvasTextItem";
import { CanvasImageItem } from "./items/CanvasImageItem";

/*
Renders the appropriate CanvasItem based on its type.

Can be expanded in the future to support additional item types.

Just a simple switch statement with specific renderers for each type.
*/
export function CanvasItemRenderer({ item }: { item: CanvasItem }) {
  switch (item.type) {
    case "image":
      return <CanvasImageItem item={item} />;

    case "text":
    default:
      return <CanvasTextItem item={item} />;
  }
}
