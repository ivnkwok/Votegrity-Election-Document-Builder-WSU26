import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CanvasTextItem } from "@/components/Canvas/items/CanvasTextItem";
import type { CanvasItem } from "@/lib/utils";

describe("CanvasTextItem", () => {
  it("renders text content including newlines", () => {
    const item: CanvasItem = {
      id: "return-address-1",
      type: "text",
      sourceToolId: "return-address",
      content: "1234 Main St\nCity, State ZIP",
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      flags: {
        isMovable: true,
        isEditable: true,
        minQuantity: 0,
        maxQuantity: 1,
      },
      styles: { fontSize: 14 },
    };

    render(
      <CanvasTextItem
        item={item}
        isEditing={false}
        onChangeItem={() => undefined}
        onExitEditMode={() => undefined}
      />
    );

    const node = screen.getByText(/1234 main st/i);
    expect(node).toBeInTheDocument();
    // The DOM text will literally contain the newline character
    expect(node.textContent).toBe("1234 Main St\nCity, State ZIP");
  });
});
