import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const {
  html2canvasMock,
  sanitizeMock,
  createObjectURLMock,
  revokeObjectURLMock,
  jsPdfState,
} = vi.hoisted(() => {
  const html2canvasMock = vi.fn();
  const sanitizeMock = vi.fn((value: string) => value);
  const createObjectURLMock = vi.fn(() => "blob:preview-pdf");
  const revokeObjectURLMock = vi.fn();
  const jsPdfState = {
    addPage: vi.fn(),
    addImage: vi.fn(),
    output: vi.fn(() => new Blob(["pdf"], { type: "application/pdf" })),
    save: vi.fn(),
  };

  return {
    html2canvasMock,
    sanitizeMock,
    createObjectURLMock,
    revokeObjectURLMock,
    jsPdfState,
  };
});

vi.mock("html2canvas-pro", () => ({
  default: html2canvasMock,
}));

vi.mock("dompurify", () => ({
  default: {
    sanitize: sanitizeMock,
  },
}));

vi.mock("jspdf", () => ({
  default: vi.fn(function MockJsPdf() {
    return jsPdfState;
  }),
}));

import { exportCanvasPagesToPdf } from "@/services/documentPdfService";

describe("documentPdfService", () => {
  beforeEach(() => {
    jsPdfState.addPage.mockReset();
    jsPdfState.addImage.mockReset();
    jsPdfState.output.mockClear();
    jsPdfState.save.mockReset();
    html2canvasMock.mockReset();
    sanitizeMock.mockClear();
    createObjectURLMock.mockClear();
    revokeObjectURLMock.mockClear();

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });

    vi.stubGlobal("URL", {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders and appends PDF pages sequentially without staging page data URLs", async () => {
    const events: string[] = [];
    const canvases = ["page-1", "page-2"].map((label) => {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("data-label", label);
      return canvas;
    });

    html2canvasMock.mockImplementation(async () => {
      const nextCanvas = canvases[html2canvasMock.mock.calls.length - 1];
      events.push(`capture:${nextCanvas.getAttribute("data-label")}`);
      return nextCanvas;
    });

    jsPdfState.addImage.mockImplementation((imageData: HTMLCanvasElement) => {
      events.push(`add:${imageData.getAttribute("data-label")}`);
      return jsPdfState;
    });

    jsPdfState.addPage.mockImplementation(() => {
      events.push("page-break");
      return jsPdfState;
    });

    jsPdfState.output.mockImplementation(() => {
      events.push("output");
      return new Blob(["pdf"], { type: "application/pdf" });
    });

    const previewWindow = { location: { href: "" } } as Window;
    vi.spyOn(window, "open").mockReturnValue(previewWindow);

    await exportCanvasPagesToPdf({
      pages: [
        [
          {
            id: "page-1-item",
            type: "text",
            sourceToolId: "text-body",
            content: "Page 1",
            x: 10,
            y: 10,
            width: 120,
            height: 40,
          },
        ],
        [
          {
            id: "page-2-item",
            type: "text",
            sourceToolId: "text-body",
            content: "Page 2",
            x: 10,
            y: 10,
            width: 120,
            height: 40,
          },
        ],
      ],
      filename: "merged.pdf",
    });

    expect(events).toEqual([
      "capture:page-1",
      "add:page-1",
      "capture:page-2",
      "page-break",
      "add:page-2",
      "output",
    ]);
    expect(jsPdfState.addPage).toHaveBeenCalledTimes(1);
    expect(jsPdfState.addImage).toHaveBeenCalledTimes(2);
    expect(jsPdfState.addImage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ getAttribute: expect.any(Function) }),
      "PNG",
      0,
      0,
      8.5,
      11,
      undefined,
      "FAST"
    );
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(previewWindow.location.href).toBe("blob:preview-pdf");
    expect(jsPdfState.save).not.toHaveBeenCalled();
  });
});
