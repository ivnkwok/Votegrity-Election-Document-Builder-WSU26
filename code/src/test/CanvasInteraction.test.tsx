import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { Canvas } from "@/components/Canvas/Canvas";
import { createEmptyDragSession } from "@/hooks/canvasDnd/dragGroup";
import type { CanvasItem } from "@/lib/utils";

function renderCanvas(items: CanvasItem[], editingItemId: string | null = null) {
  const onSelect = vi.fn();
  const onClearSelection = vi.fn();
  const onBeginEdit = vi.fn();
  const onExitEdit = vi.fn();
  const onChangeItem = vi.fn();

  render(
    <DndContext onDragEnd={() => undefined}>
      <Canvas
        canvasItems={items}
        selectedId={null}
        selectedIds={new Set<string>()}
        dragSession={createEmptyDragSession()}
        editingItemId={editingItemId}
        onSelect={onSelect}
        onClearSelection={onClearSelection}
        onBeginEdit={onBeginEdit}
        onExitEdit={onExitEdit}
        onChangeItem={onChangeItem}
      />
    </DndContext>
  );

  return { onSelect, onBeginEdit };
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

    const { onSelect, onBeginEdit } = renderCanvas(items);
    fireEvent.click(screen.getByText("Hello"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBe("text-area-1");
    expect(onBeginEdit).not.toHaveBeenCalledWith("text-area-1");
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

    const { onBeginEdit } = renderCanvas(items);
    fireEvent.doubleClick(screen.getByText("Edit me"));

    expect(onBeginEdit).toHaveBeenCalledWith("text-area-2");
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

    const { onBeginEdit } = renderCanvas(items);
    fireEvent.doubleClick(screen.getByText("Address line"));

    expect(onBeginEdit).not.toHaveBeenCalledWith("return-address-1");
  });
});
