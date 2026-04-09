import type { CanvasItem } from "@/lib/utils";

export function CanvasBoxItem({ item }: { item: CanvasItem }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        ...item.styles,
      }}
    />
  );
}
