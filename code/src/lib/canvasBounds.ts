import type { CanvasItem } from "@/lib/utils";

export interface CanvasBounds {
  width: number;
  height: number;
}

export const LETTER_PAGE_CANVAS_BOUNDS: CanvasBounds = {
  width: 816,
  height: 1056,
};

const MIN_ITEM_DIMENSION = 1;

function clampToRange(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return value;
  if (min > max) return min;
  return Math.min(Math.max(value, min), max);
}

function resolveDimension(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(MIN_ITEM_DIMENSION, value ?? fallback);
}

export function normalizeCanvasItem(
  item: CanvasItem,
  bounds: CanvasBounds = LETTER_PAGE_CANVAS_BOUNDS
): CanvasItem {
  const width = clampToRange(
    resolveDimension(item.width, 200),
    MIN_ITEM_DIMENSION,
    Math.max(bounds.width, MIN_ITEM_DIMENSION)
  );
  const height = clampToRange(
    resolveDimension(item.height, 40),
    MIN_ITEM_DIMENSION,
    Math.max(bounds.height, MIN_ITEM_DIMENSION)
  );

  return {
    ...item,
    x: clampToRange(item.x, 0, Math.max(bounds.width - width, 0)),
    y: clampToRange(item.y, 0, Math.max(bounds.height - height, 0)),
    width,
    height,
  };
}

export function mergeCanvasItemUpdates(
  item: CanvasItem,
  updates: Partial<CanvasItem>,
  bounds: CanvasBounds = LETTER_PAGE_CANVAS_BOUNDS
): CanvasItem {
  return normalizeCanvasItem(
    {
      ...item,
      ...updates,
    },
    bounds
  );
}
