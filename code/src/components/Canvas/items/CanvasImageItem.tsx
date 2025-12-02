import type { CanvasItem } from "@/lib/utils";

export function CanvasImageItem({ item }: { item: CanvasItem }) {
  return (
    <img
      src={item.content}
      alt=""
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
    />
  );
}
