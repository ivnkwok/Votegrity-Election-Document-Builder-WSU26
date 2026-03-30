import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { Canvas } from "@/components/Canvas/Canvas";
import type { CanvasItem } from "@/lib/utils";

function renderCanvas(items: CanvasItem[], editingItemId: string | null = null) {
  const setSelectedId = vi.fn();
  const setEditingItemId = vi.fn();
  const onChangeItem = vi.fn();

  render(
    <DndContext onDragEnd={() => undefined}>
      <Canvas
        canvasItems={items}
        selectedId={null}
        editingItemId={editingItemId}
        setSelectedId={setSelectedId}
        setEditingItemId={setEditingItemId}
        onChangeItem={onChangeItem}
      />
    </DndContext>
  );

  return { setSelectedId, setEditingItemId };
}

describe("Canvas editing interactions", () => {
  it("single click selects but does not enter edit mode", () => {
    const items: CanvasItem[] = [
      {
        id: "text-area-1",
        type: "text",
        sourceToolId: "text-area",
        content: "<p>Hello</p>",
        x: 10,
        y: 10,
        width: 200,
        height: 60,
        flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 99 },
        styles: {},
      },
    ];

    const { setSelectedId, setEditingItemId } = renderCanvas(items);
    fireEvent.click(screen.getByText("Hello"));

    expect(setSelectedId).toHaveBeenCalledWith("text-area-1");
    expect(setEditingItemId).not.toHaveBeenCalledWith("text-area-1");
  });

  it("double click enters edit mode for text-area", () => {
    const items: CanvasItem[] = [
      {
        id: "text-area-2",
        type: "text",
        sourceToolId: "text-area",
        content: "<p>Edit me</p>",
        x: 10,
        y: 10,
        width: 200,
        height: 60,
        flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 99 },
        styles: {},
      },
    ];

    const { setEditingItemId } = renderCanvas(items);
    fireEvent.doubleClick(screen.getByText("Edit me"));

    expect(setEditingItemId).toHaveBeenCalledWith("text-area-2");
  });

  it("double click does not enter edit mode for non-text-area text item", () => {
    const items: CanvasItem[] = [
      {
        id: "return-address-1",
        type: "text",
        sourceToolId: "return-address",
        content: "Address line",
        x: 10,
        y: 10,
        width: 200,
        height: 60,
        flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 1 },
        styles: {},
      },
    ];

    const { setEditingItemId } = renderCanvas(items);
    fireEvent.doubleClick(screen.getByText("Address line"));

    expect(setEditingItemId).not.toHaveBeenCalledWith("return-address-1");
  });
});
