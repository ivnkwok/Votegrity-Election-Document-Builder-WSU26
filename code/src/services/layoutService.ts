import type { CanvasItem } from "@/lib/utils";

// -------------------------------
// SAVE LAYOUT
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
// LOAD LAYOUT
// -------------------------------
export async function loadLayout(file: File): Promise<CanvasItem[]> {
  const text = await file.text();
  const json = JSON.parse(text);

  // NEW SCHEMA
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

  // OLD SCHEMA (flat array)
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