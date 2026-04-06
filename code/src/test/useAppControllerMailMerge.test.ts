import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { useAppController } from "@/hooks/useAppController";
import type { LoadedDocument } from "@/services/layoutService";
import { exportCanvasPagesToPdf } from "@/services/documentPdfService";

vi.mock("@/services/documentPdfService", () => {
  return {
    exportCanvasPagesToPdf: vi.fn(async () => undefined),
  };
});

function createTemplateDocWithMergeTools(): LoadedDocument {
  return {
    pageOrder: ["page-1", "page-2"],
    pageNamesById: {
      "page-1": "Page 1",
      "page-2": "Page 2",
    },
    pagesById: {
      "page-1": [
        {
          id: "address-field",
          type: "text",
          sourceToolId: "voter-address",
          content: "{{VOTER_ADDRESS}}",
          x: 20,
          y: 20,
          width: 240,
          height: 110,
        },
      ],
      "page-2": [
        {
          id: "pin-field",
          type: "text",
          sourceToolId: "voter-pin",
          content: "{{VOTER_PIN}}",
          x: 20,
          y: 30,
          width: 140,
          height: 40,
        },
      ],
    },
  };
}

function createTemplateDocWithoutMergeTools(): LoadedDocument {
  return {
    pageOrder: ["page-1"],
    pageNamesById: {
      "page-1": "Page 1",
    },
    pagesById: {
      "page-1": [
        {
          id: "plain-text",
          type: "text",
          sourceToolId: "text-body",
          content: "No merge fields",
          x: 20,
          y: 20,
          width: 200,
          height: 40,
        },
      ],
    },
  };
}

describe("useAppController mail merge", () => {
  const exportPdfMock = vi.mocked(exportCanvasPagesToPdf);

  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    exportPdfMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("blocks merge when the template has no voter merge tools", async () => {
    const { result } = renderHook(() => useAppController({ electionData: [] }));

    act(() => {
      result.current.loadDocument(createTemplateDocWithoutMergeTools());
    });

    await act(async () => {
      await result.current.handleMailMergePDF([
        {
          name: "Avery Johnson",
          addressLine1: "1221 W Riverside Ave",
          cityStateZip: "Spokane, WA 99201",
          pin: "001245",
        },
      ]);
    });

    expect(exportPdfMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("requires at least one Voter Address or Voter PIN")
    );
  });

  it("generates voter-major page output and leaves the editor state unchanged", async () => {
    const { result } = renderHook(() => useAppController({ electionData: [] }));

    act(() => {
      result.current.loadDocument(createTemplateDocWithMergeTools());
    });

    const originalActivePage = result.current.activePageId;
    const originalCanvasItems = JSON.parse(JSON.stringify(result.current.canvasItems));

    await act(async () => {
      await result.current.handleMailMergePDF(
        [
          {
            name: "Avery Johnson",
            addressLine1: "1221 W Riverside Ave",
            cityStateZip: "Spokane, WA 99201",
            pin: "001245",
          },
          {
            name: "Missing Pin",
            addressLine1: "400 Main St",
            cityStateZip: "Spokane, WA 99201",
            pin: "",
          },
          {
            name: "Morgan Lee",
            addressLine1: "874 N Maple St",
            cityStateZip: "Spokane, WA 99205",
            pin: "774301",
          },
        ],
        { sourceLabel: "Sample Voters" }
      );
    });

    expect(exportPdfMock).toHaveBeenCalledTimes(1);
    expect(exportPdfMock).toHaveBeenCalledWith({
      pages: [
        expect.arrayContaining([expect.objectContaining({ content: expect.stringContaining("Avery Johnson") })]),
        expect.arrayContaining([expect.objectContaining({ content: "001245" })]),
        expect.arrayContaining([expect.objectContaining({ content: expect.stringContaining("Morgan Lee") })]),
        expect.arrayContaining([expect.objectContaining({ content: "774301" })]),
      ],
      filename: expect.stringMatching(/^mail-merge-sample-voters-2-voters-\d{8}\.pdf$/),
    });
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("1 row(s) were skipped"));

    expect(result.current.activePageId).toBe(originalActivePage);
    expect(result.current.canvasItems).toEqual(originalCanvasItems);
    expect(result.current.isMailMerging).toBe(false);
  });
});
