import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, createEvent } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { Canvas } from "@/components/Canvas/Canvas";
import { createEmptyDragSession, type DragSession } from "@/hooks/canvasDnd/dragGroup";
import type { CanvasItem } from "@/lib/utils";

function renderCanvas(
  items: CanvasItem[],
  editingItemId: string | null = null,
  dragSession: DragSession = createEmptyDragSession()
) {
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
        dragSession={dragSession}
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

  it("prevents native modifier-click text selection while keeping multi-select behavior", () => {
    const items: CanvasItem[] = [
      {
        id: "text-area-modifier-1",
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

    renderCanvas(items);
    const target = screen.getByText("Hello");

    const pointerDown = createEvent.pointerDown(target, {
      button: 0,
      isPrimary: true,
      pointerId: 1,
      pointerType: "mouse",
      shiftKey: true,
    });
    fireEvent(target, pointerDown);

    expect(pointerDown.defaultPrevented).toBe(true);
  });

  it("applies clamped dragSession transform to active drag item", () => {
    const items: CanvasItem[] = [
      {
        id: "active-drag-1",
        type: "text",
        sourceToolId: "text-body",
        content: "Drag me",
        x: 10,
        y: 10,
        width: 200,
        height: 60,
        flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 99 },
        styles: {},
      },
    ];

    const dragSession: DragSession = {
      activeId: "active-drag-1",
      rawDelta: { x: 900, y: 600 },
      appliedDelta: { x: 24, y: 18 },
      moveIds: new Set(["active-drag-1"]),
    };

    renderCanvas(items, null, dragSession);

    const draggableNode = screen.getByText("Drag me").parentElement;
    expect(draggableNode).not.toBeNull();
    expect(draggableNode).toHaveStyle({ transform: "translate3d(24px, 18px, 0)" });
  });

  it("double click enters edit mode for text-area", () => {
    const items: CanvasItem[] = [
      {
        id: "text-area-2",
        type: "text",
        sourceToolId: "text-area",
        content: "<p><strong>Edit</strong> me</p>",
        x: 10,
        y: 10,
        width: 200,
        height: 60,
        flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 99 },
        styles: {},
      },
    ];

    const { onBeginEdit } = renderCanvas(items);
    fireEvent.doubleClick(screen.getByText("Edit"));

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
