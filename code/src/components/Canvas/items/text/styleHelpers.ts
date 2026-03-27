import type { CanvasItem } from "@/lib/utils";
import { MIXED_VALUE, type DefaultTextStyles } from "./types";

export function normalizeFontFamily(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeFontSize(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}px`;
  }

  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return `${normalized}px`;
  }

  return normalized;
}

export function stripPx(value: string): string {
  if (value.endsWith("px")) {
    return value.slice(0, -2);
  }
  return value;
}

export function normalizeCssColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized || typeof document === "undefined") return undefined;

  const el = document.createElement("span");
  el.style.color = normalized;
  return el.style.color || undefined;
}

export function toHexColor(value: string | undefined, fallback = "#000000"): string {
  if (!value) return fallback;

  const normalized = normalizeCssColor(value);
  if (!normalized) return fallback;

  if (normalized.startsWith("#")) {
    if (normalized.length === 4) {
      const r = normalized[1];
      const g = normalized[2];
      const b = normalized[3];
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return normalized.toLowerCase();
  }

  const rgbMatch = normalized.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
  if (!rgbMatch) return fallback;

  const toHex = (num: string) => Number(num).toString(16).padStart(2, "0");
  return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
}

export function deriveDefaultTextStyles(styles: CanvasItem["styles"]): DefaultTextStyles {
  return {
    fontFamily: normalizeFontFamily(styles?.fontFamily) ?? "Arial",
    fontSize: normalizeFontSize(styles?.fontSize) ?? "16px",
    color: normalizeCssColor(styles?.color) ?? "#000000",
  };
}

export function withMixedOption(options: string[], selectedValue: string): string[] {
  if (selectedValue === MIXED_VALUE || options.includes(selectedValue)) {
    return options;
  }
  return [...options, selectedValue];
}
