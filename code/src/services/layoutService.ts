import type { CanvasItem } from "@/lib/utils";

export type LayoutDocument = {
  version: "2.0.0";
  canvas: {
    width: number;
    height: number;
    background: string;
    unit: "px";
  };
  pages: Array<{
    id: string;
    name: string;
    components: any[];
  }>;
};

export type LoadedDocument = {
  pageOrder: string[];
  pageNamesById: Record<string, string>;
  pagesById: Record<string, CanvasItem[]>;
};

// -------------------------------
// SAVE LAYOUT (v1 single-page) - kept for backward compatibility
// -------------------------------
export function saveLayout(canvasItems: CanvasItem[]) {
  const layout = {
    version: "1.0.0",
    canvas: {
      width: 816,
      height: 1056,
      background: "#ffffff",
      unit: "px",
    },
    components: canvasItems.map((item) => ({
      id: item.id,
      type: item.type,
      position: { x: item.x, y: item.y },
      size: { width: item.width ?? 200, height: item.height ?? 40 },
      content: item.content,
      flags: {
        isMoveable: item.flags?.isMoveable ?? true,
        isEditable: item.flags?.isEditable ?? true,
        minQuantity: item.flags?.minQuantity ?? 0,
        maxQuantity: item.flags?.maxQuantity ?? 1,
      },
      styles: item.styles ?? {
        fontFamily: "Inter, ui-sans-serif, system-ui",
        fontSize: 14,
        fontWeight: 400,
        color: "#111827",
        textAlign: "left",
      },
    })),
  };

  const json = JSON.stringify(layout, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "canvasLayout.json";
  a.click();

  URL.revokeObjectURL(url);
}

// -------------------------------
// SAVE MULTI-PAGE DOCUMENT (v2)
// -------------------------------
export function saveDocumentLayout(args: LoadedDocument) {
  const { pageOrder, pageNamesById, pagesById } = args;

  const doc: LayoutDocument = {
    version: "2.0.0",
    canvas: {
      width: 816,
      height: 1056,
      background: "#ffffff",
      unit: "px",
    },
    pages: pageOrder.map((pageId, idx) => {
      const items = pagesById[pageId] ?? [];
      return {
        id: pageId,
        name: pageNamesById[pageId] ?? `Page ${idx + 1}`,
        components: items.map((item) => ({
          id: item.id,
          type: item.type,
          position: { x: item.x, y: item.y },
          size: { width: item.width ?? 200, height: item.height ?? 40 },
          content: item.content,
          flags: {
            isMoveable: item.flags?.isMoveable ?? true,
            isEditable: item.flags?.isEditable ?? true,
            minQuantity: item.flags?.minQuantity ?? 0,
            maxQuantity: item.flags?.maxQuantity ?? 1,
          },
          styles: item.styles ?? {
            fontFamily: "Inter, ui-sans-serif, system-ui",
            fontSize: 14,
            fontWeight: 400,
            color: "#111827",
            textAlign: "left",
          },
        })),
      };
    }),
  };

  const json = JSON.stringify(doc, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "canvasDocument.json";
  a.click();

  URL.revokeObjectURL(url);
}

// -------------------------------
// LOAD LAYOUT (v1 + legacy -> CanvasItem[])
// -------------------------------
export async function loadLayout(file: File): Promise<CanvasItem[]> {
  const text = await file.text();
  const json = JSON.parse(text);

  // v1 schema
  if (json?.components && Array.isArray(json.components)) {
    return json.components.map((c: any) => ({
      id: String(c.id ?? ""),
      type: String(c.type ?? "text"),
      content: String(c.content ?? c.type ?? ""),
      x: Number(c.position?.x ?? 0),
      y: Number(c.position?.y ?? 0),
      width: Number(c.size?.width ?? 200),
      height: Number(c.size?.height ?? 40),
      flags: {
        isMoveable: Boolean(c.flags?.isMoveable ?? true),
        isEditable: Boolean(c.flags?.isEditable ?? true),
        minQuantity: Number(c.flags?.minQuantity ?? 0),
        maxQuantity: Number(c.flags?.maxQuantity ?? 1),
      },
      styles: c.styles ?? {},
    }));
  }

  // old flat array schema
  if (Array.isArray(json)) {
    return json.map((item: any) => ({
      id: String(item.id ?? ""),
      type: String(item.type ?? "text"),
      content: String(item.content ?? ""),
      x: Number(item.x ?? 0),
      y: Number(item.y ?? 0),
      width: Number(item.width ?? 200),
      height: Number(item.height ?? 40),
      flags: {
        isMoveable: true,
        isEditable: true,
        minQuantity: 0,
        maxQuantity: 1,
      },
      styles: {},
    }));
  }

  throw new Error("Invalid layout format.");
}

// -------------------------------
// LOAD MULTI-PAGE DOCUMENT (v2) -> LoadedDocument
// If file is v1/legacy, it wraps it into a single page.
// -------------------------------
export async function loadDocumentLayout(file: File): Promise<LoadedDocument> {
  const text = await file.text();
  const json = JSON.parse(text);

  // v2 schema
  if (json?.version === "2.0.0" && Array.isArray(json.pages)) {
    const pageOrder: string[] = [];
    const pageNamesById: Record<string, string> = {};
    const pagesById: Record<string, CanvasItem[]> = {};

    for (const p of json.pages) {
      const pageId = String(p.id ?? "");
      if (!pageId) continue;

      pageOrder.push(pageId);
      pageNamesById[pageId] = String(p.name ?? "Page");

      const comps = Array.isArray(p.components) ? p.components : [];
      pagesById[pageId] = comps.map((c: any) => ({
        id: String(c.id ?? ""),
        type: String(c.type ?? "text"),
        content: String(c.content ?? c.type ?? ""),
        x: Number(c.position?.x ?? 0),
        y: Number(c.position?.y ?? 0),
        width: Number(c.size?.width ?? 200),
        height: Number(c.size?.height ?? 40),
        flags: {
          isMoveable: Boolean(c.flags?.isMoveable ?? true),
          isEditable: Boolean(c.flags?.isEditable ?? true),
          minQuantity: Number(c.flags?.minQuantity ?? 0),
          maxQuantity: Number(c.flags?.maxQuantity ?? 1),
        },
        styles: c.styles ?? {},
      }));
    }

    // Ensure at least one page
    if (pageOrder.length === 0) {
      const fallbackId = "page-1";
      pageOrder.push(fallbackId);
      pageNamesById[fallbackId] = "Page 1";
      pagesById[fallbackId] = [];
    }

    return { pageOrder, pageNamesById, pagesById };
  }

  // v1 / legacy schemas -> wrap into a single page
  const items = await loadLayout(file);
  return {
    pageOrder: ["page-1"],
    pageNamesById: { "page-1": "Page 1" },
    pagesById: { "page-1": items },
  };
}
