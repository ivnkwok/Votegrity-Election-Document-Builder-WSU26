import { describe, expect, it } from "vitest";
import {
  normalizeCssColor,
  normalizeFontFamily,
  normalizeFontSize,
  stripPx,
  toHexColor,
  withMixedOption,
} from "@/components/Canvas/items/text/styleHelpers";
import { resolveSelectionValue } from "@/components/Canvas/items/text/selectionStyles";
import { MIXED_VALUE } from "@/components/Canvas/items/text/types";

describe("Canvas text style helpers", () => {
  it("normalizes font family and font size values", () => {
    expect(normalizeFontFamily(" Arial ")).toBe("Arial");
    expect(normalizeFontFamily("  ")).toBeUndefined();
    expect(normalizeFontSize(16)).toBe("16px");
    expect(normalizeFontSize("18")).toBe("18px");
    expect(normalizeFontSize("1.5rem")).toBe("1.5rem");
    expect(stripPx("24px")).toBe("24");
  });

  it("normalizes and converts colors to hex", () => {
    expect(normalizeCssColor("red")).toBeTruthy();
    expect(toHexColor("#abc")).toBe("#aabbcc");
    expect(toHexColor("rgb(255, 0, 16)")).toBe("#ff0010");
    expect(toHexColor(undefined, "#123456")).toBe("#123456");
  });

  it("resolves selection values and mixed-option behavior", () => {
    expect(resolveSelectionValue(new Set())).toBeNull();
    expect(resolveSelectionValue(new Set(["__default__"]))).toBeNull();
    expect(resolveSelectionValue(new Set(["Arial"]))).toBe("Arial");
    expect(resolveSelectionValue(new Set(["Arial", "Georgia"]))).toBe(MIXED_VALUE);

    const options = ["Arial", "Georgia"];
    expect(withMixedOption(options, MIXED_VALUE)).toEqual(options);
    expect(withMixedOption(options, "Verdana")).toEqual(["Arial", "Georgia", "Verdana"]);
  });
});
