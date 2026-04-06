import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CanvasItemRenderer } from "@/components/Canvas/CanvasItemRenderer";
import type { CanvasItem } from "@/lib/utils";

describe("CanvasItemRenderer", () => {
  it("renders box items with their configured styles", () => {
    const item: CanvasItem = {
      id: "box-1",
      type: "box",
      sourceToolId: "grey-box",
      x: 0,
      y: 0,
      width: 120,
      height: 80,
      styles: {
        backgroundColor: "#e5e7eb",
        border: "1px solid #ccc",
      },
      flags: {
        isMovable: true,
        isEditable: false,
        minQuantity: 0,
        maxQuantity: 1,
      },
    };

    const { container } = render(
      <CanvasItemRenderer
        item={item}
        isEditing={false}
        onChangeItem={() => undefined}
        onExitEditMode={() => undefined}
      />
    );

    const box = container.firstElementChild as HTMLElement | null;
    expect(box).not.toBeNull();
    expect(box?.style.backgroundColor).toBe("rgb(229, 231, 235)");
    expect(box?.style.border).toBe("1px solid rgb(204, 204, 204)");
  });
});
