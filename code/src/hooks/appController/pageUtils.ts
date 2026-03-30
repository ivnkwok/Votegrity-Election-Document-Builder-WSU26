import type { CanvasItem } from "@/lib/utils";

export function getNextPageId(pageIds: string[]): string {
  let maxIndex = 0;

  for (const id of pageIds) {
    const match = /^page-(\d+)$/.exec(id);
    if (!match) continue;

    const value = Number(match[1]);
    if (!Number.isNaN(value)) {
      maxIndex = Math.max(maxIndex, value);
    }
  }

  let nextIndex = maxIndex + 1;
  let candidate = `page-${nextIndex}`;
  while (pageIds.includes(candidate)) {
    nextIndex += 1;
    candidate = `page-${nextIndex}`;
  }

  return candidate;
}

export function createPdfPageItem(dataUrl: string, id: string): CanvasItem {
  return {
    id,
    type: "image",
    sourceToolId: "pdf-import",
    content: dataUrl,
    x: 0,
    y: 0,
    width: 816,
    height: 1056,
    flags: {
      isMovable: false,
      isEditable: false,
      minQuantity: 1,
      maxQuantity: 1,
    },
    styles: {},
  };
}

export function cloneCanvasItems(items: CanvasItem[]): CanvasItem[] {
  return JSON.parse(JSON.stringify(items)) as CanvasItem[];
}

export interface PdfImportImage {
  dataUrl: string;
  pageNumber: number;
}

export function buildImportedPdfPages(images: PdfImportImage[], timestamp = Date.now()) {
  const newPageIds: string[] = [];
  const importedPagesById: Record<string, CanvasItem[]> = {};
  const importedPageNamesById: Record<string, string> = {};

  for (const [idx, img] of images.entries()) {
    const newPageId = `pdf-page-${timestamp}-${idx}`;
    const itemId = `pdf-img-${timestamp}-${idx}`;

    newPageIds.push(newPageId);
    importedPagesById[newPageId] = [createPdfPageItem(img.dataUrl, itemId)];
    importedPageNamesById[newPageId] = `PDF Page ${img.pageNumber}`;
  }

  return {
    newPageIds,
    importedPagesById,
    importedPageNamesById,
  };
}
