import type { CanvasItem } from "@/lib/utils";

export function CanvasTextItem({ item }: { item: CanvasItem }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        whiteSpace: "pre-wrap", // allows \n to render correctly
        ...item.styles,
      }}
    >
      {item.content}
    </div>
  );
}
