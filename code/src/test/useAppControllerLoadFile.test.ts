import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAppController } from "@/hooks/useAppController";
import { loadDocumentLayout } from "@/services/layoutService";

vi.mock("@/services/layoutService", async () => {
  const actual = await vi.importActual<typeof import("@/services/layoutService")>("@/services/layoutService");
  return {
    ...actual,
    loadDocumentLayout: vi.fn(async () => ({
      pageOrder: ["page-1"],
      pageNamesById: { "page-1": "Page 1" },
      pagesById: { "page-1": [] },
    })),
  };
});

describe("useAppController.handleLoadFile", () => {
  it("clears the input value after loading so the same file can be reselected", async () => {
    const loadDocumentLayoutMock = vi.mocked(loadDocumentLayout);
    const { result } = renderHook(() => useAppController({ electionData: [] }));
    const file = new File([JSON.stringify({ pages: [] })], "layout.json", {
      type: "application/json",
    });
    const target = {
      files: [file],
      value: "C:\\fakepath\\layout.json",
    } as unknown as HTMLInputElement;

    await act(async () => {
      await result.current.handleLoadFile({
        target,
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(loadDocumentLayoutMock).toHaveBeenCalledWith(file);
    expect(target.value).toBe("");
  });
});
