import { describe, expect, it } from "vitest";
import type { CanvasItem } from "@/lib/utils";
import { computeRigidClampedDelta, resolveDragMoveIds } from "@/hooks/canvasDnd/dragGroup";

function makeItem(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  isMovable = true
): CanvasItem {
  return {
    id,
    type: "text",
    sourceToolId: "text-body",
    content: id,
    x,
    y,
    width,
    height,
    styles: {},
    flags: {
      isMovable,
      isEditable: true,
      minQuantity: 0,
      maxQuantity: 99,
    },
  };
}

describe("dragGroup utilities", () => {
  it("resolves group move IDs for selected active items and excludes locked items", () => {
    const canvasItems = [
      makeItem("a", 10, 10, 50, 50, true),
      makeItem("b", 40, 10, 50, 50, false),
      makeItem("c", 70, 10, 50, 50, true),
    ];

    const moveIds = resolveDragMoveIds({
      activeId: "a",
      selectedIds: new Set(["a", "b", "c"]),
      canvasItems,
    });

    expect([...moveIds].sort()).toEqual(["a", "c"]);
  });

  it("resolves only active ID when active item is unselected", () => {
    const canvasItems = [
      makeItem("a", 10, 10, 50, 50, true),
      makeItem("b", 40, 10, 50, 50, true),
    ];

    const moveIds = resolveDragMoveIds({
      activeId: "a",
      selectedIds: new Set(["b"]),
      canvasItems,
    });

    expect([...moveIds]).toEqual(["a"]);
  });

  it("computes one rigid clamped delta for the whole group", () => {
    const moveItems = [
      makeItem("a", 100, 20, 50, 50, true),
      makeItem("b", 300, 340, 80, 60, true),
    ];

    const appliedDelta = computeRigidClampedDelta(
      { x: 80, y: 100 },
      moveItems,
      { width: 400, height: 400 }
    );

    expect(appliedDelta).toEqual({ x: 20, y: 0 });

    const movedA = { x: moveItems[0].x + appliedDelta.x, y: moveItems[0].y + appliedDelta.y };
    const movedB = { x: moveItems[1].x + appliedDelta.x, y: moveItems[1].y + appliedDelta.y };

    expect(movedB.x - movedA.x).toBe(moveItems[1].x - moveItems[0].x);
    expect(movedB.y - movedA.y).toBe(moveItems[1].y - moveItems[0].y);
  });
});
