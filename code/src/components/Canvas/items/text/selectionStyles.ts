import type { Editor } from "@tiptap/core";
import { MIXED_VALUE, type ResolvedSelectionValue, type SelectionStyleState } from "./types";
import { normalizeCssColor, normalizeFontFamily, normalizeFontSize } from "./styleHelpers";

export function isFullDocumentSelection(editor: Editor): boolean {
  const { from, to } = editor.state.selection;
  const end = editor.state.doc.content.size;
  return end > 0 && from <= 1 && to >= end;
}

export function resolveSelectionValue(values: Set<string>): ResolvedSelectionValue {
  if (values.size === 0) return null;
  if (values.size === 1) {
    const [onlyValue] = Array.from(values);
    return onlyValue === "__default__" ? null : onlyValue;
  }
  return MIXED_VALUE;
}

export function getSelectionStyleState(editor: Editor): SelectionStyleState {
  const { selection, doc, schema } = editor.state;
  const textStyleType = schema.marks.textStyle;

  if (!textStyleType) {
    return { fontFamily: null, fontSize: null, color: null };
  }

  if (selection.empty) {
    const attrs = editor.getAttributes("textStyle");
    return {
      fontFamily: normalizeFontFamily(attrs.fontFamily) ?? null,
      fontSize: normalizeFontSize(attrs.fontSize) ?? null,
      color: normalizeCssColor(attrs.color) ?? null,
    };
  }

  const fontFamilies = new Set<string>();
  const fontSizes = new Set<string>();
  const colors = new Set<string>();

  doc.nodesBetween(selection.from, selection.to, (node) => {
    if (!node.isText) return;

    const styleMark = node.marks.find((mark) => mark.type === textStyleType);
    const attrs = styleMark?.attrs ?? {};

    fontFamilies.add(normalizeFontFamily(attrs.fontFamily) ?? "__default__");
    fontSizes.add(normalizeFontSize(attrs.fontSize) ?? "__default__");
    colors.add(normalizeCssColor(attrs.color) ?? "__default__");
  });

  return {
    fontFamily: resolveSelectionValue(fontFamilies),
    fontSize: resolveSelectionValue(fontSizes),
    color: resolveSelectionValue(colors),
  };
}
