export function isPointInsideRect(
  pointX: number,
  pointY: number,
  rect: Pick<DOMRect, "left" | "right" | "top" | "bottom">
): boolean {
  return pointX >= rect.left && pointX <= rect.right && pointY >= rect.top && pointY <= rect.bottom;
}

export function clampToRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
