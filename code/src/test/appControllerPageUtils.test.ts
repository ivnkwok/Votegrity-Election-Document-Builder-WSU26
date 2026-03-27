import { describe, expect, it } from "vitest";
import { buildImportedPdfPages, getNextPageId } from "@/hooks/appController/pageUtils";

describe("appController page utils", () => {
  it("computes the next page id from existing numeric ids", () => {
    expect(getNextPageId(["page-1", "page-3", "misc"])).toBe("page-4");
  });

  it("builds deterministic imported PDF pages", () => {
    const result = buildImportedPdfPages(
      [
        { dataUrl: "data:image/png;base64,a", pageNumber: 1 },
        { dataUrl: "data:image/png;base64,b", pageNumber: 2 },
      ],
      12345
    );

    expect(result.newPageIds).toEqual(["pdf-page-12345-0", "pdf-page-12345-1"]);
    expect(result.importedPageNamesById["pdf-page-12345-1"]).toBe("PDF Page 2");
    expect(result.importedPagesById["pdf-page-12345-0"][0]).toMatchObject({
      id: "pdf-img-12345-0",
      sourceToolId: "pdf-import",
      width: 816,
      height: 1056,
      content: "data:image/png;base64,a",
    });
  });
});
