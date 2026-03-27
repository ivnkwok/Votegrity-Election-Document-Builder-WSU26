import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePageState } from "@/hooks/appController/usePageState";
import type { CanvasItem } from "@/lib/utils";

function makeTextItem(id: string): CanvasItem {
  return {
    id,
    type: "text",
    sourceToolId: "text-body",
    content: "Sample",
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    flags: {
      isMovable: true,
      isEditable: true,
      minQuantity: 0,
      maxQuantity: 1,
    },
    styles: { fontSize: "14px" },
  };
}

describe("usePageState", () => {
  it("supports add, rename, and reorder operations", () => {
    const { result } = renderHook(() => usePageState());

    act(() => {
      result.current.addPage();
    });

    expect(result.current.pageOrder).toEqual(["page-1", "page-2"]);
    expect(result.current.activePageId).toBe("page-2");

    act(() => {
      result.current.renamePage("Cover", "page-2");
    });

    expect(result.current.pageNamesById["page-2"]).toBe("Cover");

    act(() => {
      result.current.movePage("page-2", -1);
    });

    expect(result.current.pageOrder).toEqual(["page-2", "page-1"]);
  });

  it("duplicates the active page and deep-clones its items", () => {
    const { result } = renderHook(() => usePageState());
    const sourceItem = makeTextItem("text-1");

    act(() => {
      result.current.setCanvasItems([sourceItem]);
    });

    act(() => {
      result.current.duplicatePage();
    });

    expect(result.current.activePageId).toBe("page-2");
    expect(result.current.pageOrder).toEqual(["page-1", "page-2"]);
    expect(result.current.canvasItems).toHaveLength(1);
    expect(result.current.canvasItems[0].id).toBe("text-1");
    expect(result.current.canvasItems[0]).not.toBe(sourceItem);
  });

  it("saves current page state on switch and supports delete", () => {
    const { result } = renderHook(() => usePageState());

    act(() => {
      result.current.addPage();
    });

    act(() => {
      result.current.setCanvasItems([makeTextItem("page-2-item")]);
    });

    act(() => {
      result.current.switchPage("page-1");
    });

    expect(result.current.activePageId).toBe("page-1");
    expect(result.current.pagesById["page-2"]).toHaveLength(1);

    act(() => {
      result.current.deletePage();
    });

    expect(result.current.pageOrder).toEqual(["page-2"]);
    expect(result.current.activePageId).toBe("page-2");
  });
});
