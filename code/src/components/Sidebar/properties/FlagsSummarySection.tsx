import type { CanvasItem } from "@/lib/utils";

export function FlagsSummarySection({ item }: { item: CanvasItem }) {
  const isMovable = item.flags?.isMovable !== false;

  return (
    <>
      <div>
        <strong>Movable:</strong> {isMovable ? "Yes" : "No"}
      </div>
      <div>
        <strong>Editable:</strong> {item.flags?.isEditable ? "Yes" : "No"}
      </div>
      <div>
        <strong>Min Qty:</strong> {item.flags?.minQuantity ?? "-"}
      </div>
      <div>
        <strong>Max Qty:</strong> {item.flags?.maxQuantity ?? "-"}
      </div>
    </>
  );
}
