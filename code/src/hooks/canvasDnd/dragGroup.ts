import type { CanvasItem } from "@/lib/utils";
import { clampToRange } from "./positionUtils";

export interface DragDelta {
  x: number;
  y: number;
}

export interface DragSession {
  activeId: string | null;
  rawDelta: DragDelta;
  appliedDelta: DragDelta;
  moveIds: Set<string>;
}

export function createEmptyDragSession(): DragSession {
  return {
    activeId: null,
    rawDelta: { x: 0, y: 0 },
    appliedDelta: { x: 0, y: 0 },
    moveIds: new Set<string>(),
  };
}

export function isItemMovable(item: CanvasItem | undefined): item is CanvasItem {
  if (!item) return false;
  return item.flags?.isMovable !== false;
}

export function resolveDragMoveIds(args: {
  activeId: string;
  selectedIds: Set<string>;
  canvasItems: CanvasItem[];
}): Set<string> {
  const { activeId, selectedIds, canvasItems } = args;
  const itemById = new Map(canvasItems.map((item) => [item.id, item]));
  const activeItem = itemById.get(activeId);
  if (!isItemMovable(activeItem)) {
    return new Set<string>();
  }

  if (!selectedIds.has(activeId)) {
    return new Set([activeId]);
  }

  const movableSelected = new Set<string>();
  selectedIds.forEach((id) => {
    const item = itemById.get(id);
    if (isItemMovable(item)) {
      movableSelected.add(id);
    }
  });

  if (!movableSelected.has(activeId)) {
    movableSelected.add(activeId);
  }

  return movableSelected;
}

export function getMoveItems(canvasItems: CanvasItem[], moveIds: Set<string>): CanvasItem[] {
  if (moveIds.size === 0) return [];
  return canvasItems.filter((item) => moveIds.has(item.id));
}

function clampDeltaComponent(value: number, min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 0;
  if (min > max) return 0;
  return clampToRange(value, min, max);
}

export function computeRigidClampedDelta(
  rawDelta: DragDelta,
  moveItems: CanvasItem[],
  canvasRect: Pick<DOMRect, "width" | "height">
): DragDelta {
  if (moveItems.length === 0) {
    return { x: 0, y: 0 };
  }

  let minDeltaX = -Infinity;
  let maxDeltaX = Infinity;
  let minDeltaY = -Infinity;
  let maxDeltaY = Infinity;

  moveItems.forEach((item) => {
    const width = item.width ?? 0;
    const height = item.height ?? 0;

    minDeltaX = Math.max(minDeltaX, -item.x);
    maxDeltaX = Math.min(maxDeltaX, canvasRect.width - (item.x + width));
    minDeltaY = Math.max(minDeltaY, -item.y);
    maxDeltaY = Math.min(maxDeltaY, canvasRect.height - (item.y + height));
  });

  return {
    x: clampDeltaComponent(rawDelta.x, minDeltaX, maxDeltaX),
    y: clampDeltaComponent(rawDelta.y, minDeltaY, maxDeltaY),
  };
}
