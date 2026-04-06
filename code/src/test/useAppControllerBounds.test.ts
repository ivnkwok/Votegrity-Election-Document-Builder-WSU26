import { act, fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAppController } from "@/hooks/useAppController";
import type { CanvasItem } from "@/lib/utils";

function makeItem(id: string, x: number, y: number, width: number, height: number): CanvasItem {
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
      isMovable: true,
      isEditable: true,
      minQuantity: 0,
      maxQuantity: 99,
    },
  };
}

describe("useAppController bounds handling", () => {
  it("clamps keyboard nudges to the page bounds", () => {
    const { result } = renderHook(() => useAppController({ electionData: [] }));

    act(() => {
      result.current.setCanvasItems([makeItem("edge-item", 760, 1000, 50, 50)]);
      result.current.setSelectedIds(new Set(["edge-item"]));
    });

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowRight", shiftKey: true });
      fireEvent.keyDown(window, { key: "ArrowDown", shiftKey: true });
    });

    expect(result.current.canvasItems[0]).toMatchObject({
      x: 766,
      y: 1006,
    });
  });

  it("clamps manual position changes and rejects negative sizes", () => {
    const { result } = renderHook(() => useAppController({ electionData: [] }));

    act(() => {
      result.current.setCanvasItems([makeItem("edit-item", 20, 30, 80, 40)]);
    });

    act(() => {
      result.current.updateItem("edit-item", { x: 900 });
    });

    expect(result.current.canvasItems[0]).toMatchObject({
      x: 736,
      width: 80,
    });

    act(() => {
      result.current.updateItem("edit-item", { width: -20, height: -10 });
    });

    expect(result.current.canvasItems[0]).toMatchObject({
      width: 1,
      height: 1,
    });
  });
});
