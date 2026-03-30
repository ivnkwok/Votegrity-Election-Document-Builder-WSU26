import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    expect(node.textContent).toBe("1234 Main St\nCity, State ZIP");
  });

  it("renders rich text preview as non-selectable when not editing", () => {
    const item: CanvasItem = {
      id: "text-area-preview",
      type: "text",
      sourceToolId: "text-area",
      content: "<p>Edit me</p>",
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      flags: {
        isMovable: true,
        isEditable: true,
        minQuantity: 0,
        maxQuantity: 999,
      },
      styles: { fontFamily: "Arial", fontSize: "14px", color: "#000000" },
    };

    render(
      <CanvasTextItem
        item={item}
        isEditing={false}
        onChangeItem={() => undefined}
        onExitEditMode={() => undefined}
      />
    );

    const preview = screen.getByTestId("rich-text-preview");
    expect(preview).toHaveStyle({ userSelect: "none" });
    expect(preview).toHaveStyle({ pointerEvents: "none" });
    expect(screen.getByText("Edit me")).toBeInTheDocument();
  });

  it("exits edit mode on Escape for rich text areas", () => {
    const onExitEditMode = vi.fn();
    const item: CanvasItem = {
      id: "text-area-1",
      type: "text",
      sourceToolId: "text-area",
      content: "<p>Edit me</p>",
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      flags: {
        isMovable: true,
        isEditable: true,
        minQuantity: 0,
        maxQuantity: 999,
      },
      styles: { fontFamily: "Arial", fontSize: "14px", color: "#000000" },
    };

    render(
      <CanvasTextItem
        item={item}
        isEditing={true}
        onChangeItem={() => undefined}
        onExitEditMode={onExitEditMode}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onExitEditMode).toHaveBeenCalledTimes(1);
  });
});
