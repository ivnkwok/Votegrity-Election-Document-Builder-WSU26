import { afterEach, describe, expect, it, vi } from "vitest";
import { convertPdfFileToImages, getPdfPageCount } from "@/components/pdfUploader/pdfProcessing";

describe("pdfProcessing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads page count from PDF document", async () => {
    const pdfMock = { numPages: 3 };
    const pdfjsLib = {
      getDocument: vi.fn(() => ({ promise: Promise.resolve(pdfMock) })),
    };

    const file = {
      arrayBuffer: vi.fn(async () => new ArrayBuffer(8)),
    } as unknown as File;

    const count = await getPdfPageCount(pdfjsLib as never, file);

    expect(count).toBe(3);
    expect(pdfjsLib.getDocument).toHaveBeenCalledTimes(1);
  });

  it("converts each PDF page into a PNG data URL", async () => {
    let canvasCount = 0;
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === "canvas") {
        canvasCount += 1;
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({ fake: true })),
          toDataURL: vi.fn(() => `data:image/png;base64,${canvasCount}`),
        } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tagName);
    });

    const pageMock = {
      getViewport: vi.fn(() => ({ width: 200, height: 300 })),
      render: vi.fn(() => ({ promise: Promise.resolve() })),
    };

    const pdfMock = {
      numPages: 2,
      getPage: vi.fn(async () => pageMock),
    };

    const pdfjsLib = {
      getDocument: vi.fn(() => ({ promise: Promise.resolve(pdfMock) })),
    };

    const file = {
      arrayBuffer: vi.fn(async () => new ArrayBuffer(8)),
    } as unknown as File;

    const images = await convertPdfFileToImages(pdfjsLib as never, file);

    expect(images).toEqual([
      { dataUrl: "data:image/png;base64,1", pageNumber: 1 },
      { dataUrl: "data:image/png;base64,2", pageNumber: 2 },
    ]);
    expect(pdfMock.getPage).toHaveBeenCalledTimes(2);
    expect(pageMock.render).toHaveBeenCalledTimes(2);
  });
});
