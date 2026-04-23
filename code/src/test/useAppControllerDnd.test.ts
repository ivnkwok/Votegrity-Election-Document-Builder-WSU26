import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { useAppController } from "@/hooks/useAppController";
import type { CanvasItem } from "@/lib/utils";

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

function mockPageRect(width: number, height: number): void {
  document.body.innerHTML = '<div id="page"></div>';
  const page = document.getElementById("page");
  if (!page) throw new Error("missing page element");

  Object.defineProperty(page, "getBoundingClientRect", {
    configurable: true,
    value: () =>
      ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: width,
        bottom: height,
        width,
        height,
        toJSON: () => ({}),
      }) as DOMRect,
  });
}

function createDragStartEvent(activeId: string): DragStartEvent {
  return {
    active: {
      id: activeId,
    },
  } as unknown as DragStartEvent;
}

function createDragMoveEvent(activeId: string, x: number, y: number): DragMoveEvent {
  return {
    active: {
      id: activeId,
    },
    delta: { x, y },
  } as unknown as DragMoveEvent;
}

function createDragEndEvent(activeId: string, x: number, y: number): DragEndEvent {
  return {
    active: {
      id: activeId,
      rect: {
        current: {
          translated: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
          },
        },
      },
      data: {
        current: {},
      },
    },
    over: null,
    delta: { x, y },
  } as unknown as DragEndEvent;
}

function createToolDropEvent(toolId: string, left: number, top: number): DragEndEvent {
  return {
    active: {
      id: toolId,
      rect: {
        current: {
          translated: {
            left,
            top,
            right: left,
            bottom: top,
            width: 0,
            height: 0,
          },
        },
      },
      data: {
        current: {},
      },
    },
    over: {
      id: "canvas",
    },
    delta: { x: 0, y: 0 },
  } as unknown as DragEndEvent;
}

describe("useAppController drag session behavior", () => {
  it("clears drag preview state on cancel without mutating positions", () => {
    mockPageRect(500, 700);

    const { result } = renderHook(() => useAppController({ electionData: [] }));

    act(() => {
      result.current.setCanvasItems([
        makeItem("a", 10, 10, 50, 50, true),
        makeItem("b", 80, 10, 50, 50, true),
      ]);
      result.current.setSelectedIds(new Set(["a", "b"]));
    });

    act(() => {
      result.current.handleDragStart(createDragStartEvent("a"));
      result.current.handleDragMove(createDragMoveEvent("a", 15, 0));
    });

    expect(result.current.dragSession.activeId).toBe("a");
    expect(result.current.dragSession.moveIds.has("a")).toBe(true);
    expect(result.current.dragSession.moveIds.has("b")).toBe(true);
    expect(result.current.dragSession.appliedDelta).toEqual({ x: 15, y: 0 });

    act(() => {
      result.current.handleDragCancel();
    });

    expect(result.current.dragSession.activeId).toBeNull();
    expect(result.current.dragSession.moveIds.size).toBe(0);
    expect(result.current.canvasItems.map((item) => ({ id: item.id, x: item.x, y: item.y }))).toEqual([
      { id: "a", x: 10, y: 10 },
      { id: "b", x: 80, y: 10 },
    ]);
  });

  it("commits the same clamped delta shown during preview even if drag end reports a larger delta", () => {
    mockPageRect(400, 500);

    const { result } = renderHook(() => useAppController({ electionData: [] }));

    act(() => {
      result.current.setCanvasItems([
        makeItem("a", 100, 20, 50, 50, true),
        makeItem("b", 300, 20, 80, 50, true),
      ]);
      result.current.setSelectedIds(new Set(["a", "b"]));
    });

    act(() => {
      result.current.handleDragStart(createDragStartEvent("a"));
      result.current.handleDragMove(createDragMoveEvent("a", 60, 0));
    });

    expect(result.current.dragSession.appliedDelta).toEqual({ x: 20, y: 0 });

    act(() => {
      result.current.handleDragEnd(createDragEndEvent("a", 600, 0));
    });

    expect(result.current.canvasItems.map((item) => ({ id: item.id, x: item.x, y: item.y }))).toEqual([
      { id: "a", x: 120, y: 20 },
      { id: "b", x: 320, y: 20 },
    ]);
    expect(result.current.dragSession.activeId).toBeNull();
    expect(result.current.dragSession.moveIds.size).toBe(0);
  });

  it("moves only movable peers when locked items are selected", () => {
    mockPageRect(500, 700);

    const { result } = renderHook(() => useAppController({ electionData: [] }));

    act(() => {
      result.current.setCanvasItems([
        makeItem("a", 10, 10, 50, 50, true),
        makeItem("b", 80, 10, 50, 50, false),
      ]);
      result.current.setSelectedIds(new Set(["a", "b"]));
    });

    act(() => {
      result.current.handleDragStart(createDragStartEvent("a"));
      result.current.handleDragMove(createDragMoveEvent("a", 20, 0));
      result.current.handleDragEnd(createDragEndEvent("a", 20, 0));
    });

    expect(result.current.canvasItems.map((item) => ({ id: item.id, x: item.x, y: item.y }))).toEqual([
      { id: "a", x: 30, y: 10 },
      { id: "b", x: 80, y: 10 },
    ]);
  });

  it("blocks tool drops that exceed the configured page quantity limit", () => {
    mockPageRect(500, 700);

    const { result } = renderHook(() => useAppController({ electionData: [] }));

    act(() => {
      result.current.setCanvasItems([
        {
          ...makeItem("return-address-1", 10, 10, 200, 60, true),
          sourceToolId: "return-address",
          content: "1234 Main St",
        },
      ]);
    });

    act(() => {
      result.current.handleDragEnd(createToolDropEvent("return-address", 100, 120));
    });

    expect(result.current.canvasItems).toHaveLength(1);
    expect(result.current.toolStatusMessage).toContain("can only be added once on this page");
  });

  it("blocks Q&A drops until an election with questions is selected", () => {
    mockPageRect(500, 700);

    const { result } = renderHook(() => useAppController({ electionData: [] }));

    act(() => {
      result.current.handleDragEnd(createToolDropEvent("question-answer", 100, 120));
    });

    expect(result.current.canvasItems).toHaveLength(0);
    expect(result.current.toolStatusMessage).toContain("Select an election with questions");
  });

  it("preserves source question order when generating Q&A items", () => {
    mockPageRect(500, 700);

    const electionData = [
      {
        id: 2,
        question: "Consent to electronic notice",
        answers: ["Yes"],
      },
      {
        id: 1,
        question: "Board of Directors",
        answers: ["Alice Example", "Write-in"],
      },
    ];

    const { result } = renderHook(() => useAppController({ electionData }));

    act(() => {
      result.current.handleDragEnd(createToolDropEvent("question-answer", 100, 120));
    });

    expect(result.current.canvasItems.map((item) => item.content)).toEqual([
      "Consent to electronic notice",
      "[ ] Yes",
      "Board of Directors",
      "[ ] Alice Example",
      "[ ]           ",
    ]);
    expect(result.current.toolStatusMessage).toBeNull();
  });
});
