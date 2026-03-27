import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolbarButton } from "./ToolbarButton";
import { MIXED_VALUE, type DefaultTextStyles, type SelectionStyleState } from "./types";
import { normalizeFontSize, stripPx } from "./styleHelpers";

interface RichTextToolbarProps {
  editor: Editor;
  isEditing: boolean;
  itemRef: MutableRefObject<HTMLDivElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  toolbarRef: MutableRefObject<HTMLDivElement | null>;
  selectionStyles: SelectionStyleState;
  resolvedFontFamily: string;
  resolvedFontSize: string;
  resolvedColorHex: string;
  fontFamilyOptions: string[];
  fontSizeChoices: string[];
  fontSizeDraft: string;
  setFontSizeDraft: (value: string) => void;
  isFontSizeMenuOpen: boolean;
  setIsFontSizeMenuOpen: Dispatch<SetStateAction<boolean>>;
  onApplyCustomFontSize: (rawValue: string) => void;
  onSyncDefaultStyles: (patch: Partial<DefaultTextStyles>) => void;
}

export function RichTextToolbar({
  editor,
  isEditing,
  itemRef,
  contentRef,
  toolbarRef,
  selectionStyles,
  resolvedFontFamily,
  resolvedFontSize,
  resolvedColorHex,
  fontFamilyOptions,
  fontSizeChoices,
  fontSizeDraft,
  setFontSizeDraft,
  isFontSizeMenuOpen,
  setIsFontSizeMenuOpen,
  onApplyCustomFontSize,
  onSyncDefaultStyles,
}: RichTextToolbarProps) {
  const shouldShowToolbar = () => {
    if (!isEditing) return false;

    const active = document.activeElement;
    if (!active) return Boolean(editor.isFocused);

    const inEditor = contentRef.current?.contains(active) ?? false;
    const inToolbar = toolbarRef.current?.contains(active) ?? false;
    return Boolean(editor.isFocused) || inEditor || inToolbar;
  };

  const getToolbarAnchor = () => {
    const anchorEl = itemRef.current ?? contentRef.current;
    if (!anchorEl) return null;

    return {
      getBoundingClientRect: () => anchorEl.getBoundingClientRect(),
    };
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShowToolbar}
      getReferencedVirtualElement={getToolbarAnchor}
      options={{ offset: 8, placement: "top-start", shift: true, flip: true }}
    >
      <div
        ref={toolbarRef}
        className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 shadow"
      >
        <ToolbarButton
          label="B"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="U"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />

        <select
          value={resolvedFontFamily}
          onChange={(e) => {
            if (e.target.value === MIXED_VALUE) return;
            editor.chain().focus().setMark("textStyle", { fontFamily: e.target.value }).run();
            onSyncDefaultStyles({ fontFamily: e.target.value });
          }}
          className="h-7 w-28 rounded border border-gray-300 px-1 text-xs"
          aria-label="Font family"
        >
          {resolvedFontFamily === MIXED_VALUE && (
            <option value={MIXED_VALUE} disabled>
              Mixed
            </option>
          )}
          {fontFamilyOptions
            .filter((option) => option !== MIXED_VALUE)
            .map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
        </select>

        <div className="relative">
          <Input
            type="text"
            inputMode="decimal"
            value={fontSizeDraft}
            placeholder={resolvedFontSize === MIXED_VALUE ? "Mixed" : "px"}
            onFocus={() => setIsFontSizeMenuOpen(true)}
            onChange={(e) => {
              setFontSizeDraft(e.target.value);
              setIsFontSizeMenuOpen(true);
            }}
            onBlur={(e) => {
              onApplyCustomFontSize(e.target.value);
              setIsFontSizeMenuOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onApplyCustomFontSize(e.currentTarget.value);
                setIsFontSizeMenuOpen(false);
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                const fallback = normalizeFontSize(resolvedFontSize);
                setFontSizeDraft(fallback ? stripPx(fallback) : "");
                setIsFontSizeMenuOpen(false);
                e.currentTarget.blur();
              }
            }}
            className="h-7 w-16 px-1 pr-5 text-xs"
            aria-label="Font size combobox in pixels"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsFontSizeMenuOpen((prev) => !prev)}
            className="absolute inset-y-0 right-0 h-7 w-4 rounded-none px-0 text-[10px] text-gray-600 hover:bg-transparent"
            aria-label="Toggle font size options"
          >
            v
          </Button>
          {isFontSizeMenuOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 max-h-32 w-16 overflow-y-auto rounded border border-gray-300 bg-white shadow">
              {fontSizeChoices.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onApplyCustomFontSize(value);
                    setIsFontSizeMenuOpen(false);
                  }}
                  className="h-7 w-full justify-start rounded-none px-2 text-xs"
                >
                  {value}
                </Button>
              ))}
            </div>
          )}
        </div>

        <input
          type="color"
          value={resolvedColorHex}
          onChange={(e) => {
            editor.chain().focus().setColor(e.target.value).run();
            onSyncDefaultStyles({ color: e.target.value });
          }}
          className="h-7 w-8 rounded border border-gray-300 bg-white p-0.5"
        />
        {selectionStyles.color === MIXED_VALUE && <span className="text-[10px] text-gray-500">Mixed</span>}
      </div>
    </BubbleMenu>
  );
}
