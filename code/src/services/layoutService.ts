import type { CanvasItem } from "@/lib/utils";

function toCanvasItemType(value: unknown): CanvasItem["type"] {
  if (value === "image" || value === "box" || value === "text") {
    return value;
  }
  return "text";
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

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
    components: unknown[];
  }>;
};

export type LoadedDocument = {
  pageOrder: string[];
  pageNamesById: Record<string, string>;
  pagesById: Record<string, CanvasItem[]>;
};

function toDocumentComponent(item: CanvasItem) {
  return {
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
  };
}

function toCanvasItem(component: unknown): CanvasItem {
  const c = toRecord(component);
  const position = toRecord(c.position);
  const size = toRecord(c.size);
  const flags = toRecord(c.flags);
  const styles = toRecord(c.styles);

  return {
    id: String(c.id ?? ""),
    type: toCanvasItemType(c.type),
    content: String(c.content ?? c.type ?? ""),
    x: toNumber(position.x, 0),
    y: toNumber(position.y, 0),
    width: toNumber(size.width, 200),
    height: toNumber(size.height, 40),
    flags: {
      isMoveable: Boolean(flags.isMoveable ?? true),
      isEditable: Boolean(flags.isEditable ?? true),
      minQuantity: toNumber(flags.minQuantity, 0),
      maxQuantity: toNumber(flags.maxQuantity, 1),
    },
    styles: styles as CanvasItem["styles"],
  };
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
        components: items.map(toDocumentComponent),
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
// LOAD MULTI-PAGE DOCUMENT (v2) -> LoadedDocument
// -------------------------------
export async function loadDocumentLayout(file: File): Promise<LoadedDocument> {
  const text = await file.text();
  const json = JSON.parse(text);

  if (json?.version !== "2.0.0" || !Array.isArray(json.pages)) {
    throw new Error("Invalid layout format. Expected v2 document schema.");
  }

  const pageOrder: string[] = [];
  const pageNamesById: Record<string, string> = {};
  const pagesById: Record<string, CanvasItem[]> = {};

  for (const page of json.pages as unknown[]) {
    const p = toRecord(page);
    const pageId = String(p.id ?? "");
    if (!pageId) continue;

    pageOrder.push(pageId);
    pageNamesById[pageId] = String(p.name ?? "Page");

    const components = Array.isArray(p.components) ? p.components : [];
    pagesById[pageId] = components.map(toCanvasItem);
  }

  if (pageOrder.length === 0) {
    const fallbackId = "page-1";
    pageOrder.push(fallbackId);
    pageNamesById[fallbackId] = "Page 1";
    pagesById[fallbackId] = [];
  }

  return {
    pageOrder,
    pageNamesById,
    pagesById,
  };
}
