import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import DOMPurify from "dompurify";
import { Extension } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { CanvasItem } from "@/lib/utils";

interface CanvasTextItemProps {
  item: CanvasItem;
  isEditing: boolean;
  onChangeItem: (id: string, updates: Partial<CanvasItem>) => void;
  onExitEditMode: () => void;
}

const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 30, 36];
const MIXED_VALUE = "__mixed__";

type ResolvedSelectionValue = string | null | typeof MIXED_VALUE;

interface SelectionStyleState {
  fontFamily: ResolvedSelectionValue;
  fontSize: ResolvedSelectionValue;
  color: ResolvedSelectionValue;
}

interface DefaultTextStyles {
  fontFamily: string;
  fontSize: string;
  color: string;
}

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

function normalizeFontFamily(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeFontSize(value: unknown): string | undefined {
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

function stripPx(value: string): string {
  if (value.endsWith("px")) {
    return value.slice(0, -2);
  }
  return value;
}

function normalizeCssColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized || typeof document === "undefined") return undefined;

  const el = document.createElement("span");
  el.style.color = normalized;
  return el.style.color || undefined;
}

function toHexColor(value: string | undefined, fallback = "#000000"): string {
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

function deriveDefaultTextStyles(styles: CanvasItem["styles"]): DefaultTextStyles {
  return {
    fontFamily: normalizeFontFamily(styles?.fontFamily) ?? "Arial",
    fontSize: normalizeFontSize(styles?.fontSize) ?? "16px",
    color: normalizeCssColor(styles?.color) ?? "#000000",
  };
}

function isFullDocumentSelection(editor: Editor): boolean {
  const { from, to } = editor.state.selection;
  const end = editor.state.doc.content.size;
  return end > 0 && from <= 1 && to >= end;
}

function resolveSelectionValue(values: Set<string>): ResolvedSelectionValue {
  if (values.size === 0) return null;
  if (values.size === 1) {
    const onlyValue = Array.from(values)[0];
    return onlyValue === "__default__" ? null : onlyValue;
  }
  return MIXED_VALUE;
}

function getSelectionStyleState(editor: Editor): SelectionStyleState {
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

function withMixedOption(options: string[], selectedValue: string): string[] {
  if (selectedValue === MIXED_VALUE || options.includes(selectedValue)) {
    return options;
  }
  return [...options, selectedValue];
}

function ToolbarButton({
  active,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded border px-2 py-1 text-xs ${
        active ? "border-blue-600 bg-blue-100 text-blue-900" : "border-gray-300 bg-white text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function RichTextAreaItem({
  item,
  isEditing,
  onChangeItem,
  onExitEditMode,
}: CanvasTextItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const skipNextFullContentSyncRef = useRef(false);
  const sanitizedHtml = useMemo(
    () => DOMPurify.sanitize(item.content ?? "<p></p>"),
    [item.content]
  );
  const [draftHtml, setDraftHtml] = useState<string>(sanitizedHtml);
  const defaultStyles = useMemo(() => deriveDefaultTextStyles(item.styles), [item.styles]);
  const lastDefaultStylesRef = useRef<DefaultTextStyles>(defaultStyles);

  const editor = useEditor(
    {
      extensions: [StarterKit, TextStyle, Color, FontFamily, FontSize],
      content: sanitizedHtml,
      editable: isEditing,
      editorProps: {
        attributes: {
          class: "h-full w-full outline-none",
          style: "min-height: 100%; white-space: pre-wrap;",
        },
      },
      onUpdate: ({ editor: activeEditor }) => {
        setDraftHtml(activeEditor.getHTML());
      },
    },
    [item.id]
  );

  const selectionStyles =
    useEditorState({
      editor,
      selector: ({ editor: activeEditor }) =>
        activeEditor ? getSelectionStyleState(activeEditor) : null,
    }) ?? { fontFamily: null, fontSize: null, color: null };

  const resolvedFontFamily =
    selectionStyles.fontFamily === MIXED_VALUE
      ? MIXED_VALUE
      : selectionStyles.fontFamily ?? defaultStyles.fontFamily;
  const resolvedFontSize =
    selectionStyles.fontSize === MIXED_VALUE
      ? MIXED_VALUE
      : selectionStyles.fontSize ?? defaultStyles.fontSize;
  const resolvedColorCss =
    selectionStyles.color === MIXED_VALUE ? defaultStyles.color : selectionStyles.color ?? defaultStyles.color;
  const resolvedColorHex = toHexColor(resolvedColorCss, "#000000");

  const fontFamilyOptions = useMemo(
    () => withMixedOption(FONT_FAMILIES, resolvedFontFamily),
    [resolvedFontFamily]
  );

  const fontSizeChoices = useMemo(() => {
    const base = FONT_SIZES.map((size) => String(size));
    const normalized = normalizeFontSize(resolvedFontSize);
    if (!normalized || resolvedFontSize === MIXED_VALUE) return base;
    const current = stripPx(normalized);
    return base.includes(current) ? base : [...base, current];
  }, [resolvedFontSize]);
  const [fontSizeDraft, setFontSizeDraft] = useState<string>("");
  const [isFontSizeMenuOpen, setIsFontSizeMenuOpen] = useState(false);

  useEffect(() => {
    if (resolvedFontSize === MIXED_VALUE) {
      setFontSizeDraft("");
      return;
    }

    const normalized = normalizeFontSize(resolvedFontSize);
    setFontSizeDraft(normalized ? stripPx(normalized) : "");
  }, [resolvedFontSize]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(isEditing);
    if (isEditing) {
      editor.commands.focus("end");
    }
  }, [editor, isEditing]);

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === sanitizedHtml) return;
    editor.commands.setContent(sanitizedHtml, { emitUpdate: false });
    setDraftHtml(sanitizedHtml);
  }, [editor, sanitizedHtml]);

  useEffect(() => {
    if (!editor) return;

    const prev = lastDefaultStylesRef.current;
    const next = defaultStyles;
    const hasStyleChange =
      prev.fontFamily !== next.fontFamily ||
      prev.fontSize !== next.fontSize ||
      prev.color !== next.color;

    if (!hasStyleChange) return;

    lastDefaultStylesRef.current = next;

    if (skipNextFullContentSyncRef.current) {
      skipNextFullContentSyncRef.current = false;
      return;
    }

    const end = editor.state.doc.content.size;
    if (end <= 0) return;

    const { from, to } = editor.state.selection;

    editor
      .chain()
      .setTextSelection({ from: 1, to: end })
      .setMark("textStyle", {
        fontFamily: next.fontFamily,
        fontSize: next.fontSize,
        color: next.color,
      })
      .run();

    const safeFrom = Math.max(1, Math.min(from, end));
    const safeTo = Math.max(safeFrom, Math.min(to, end));
    editor.chain().setTextSelection({ from: safeFrom, to: safeTo }).run();

    const updatedHtml = editor.getHTML();
    setDraftHtml(updatedHtml);

    if (updatedHtml !== item.content) {
      onChangeItem(item.id, { content: updatedHtml });
    }
  }, [defaultStyles, editor, item.content, item.id, onChangeItem]);

  useEffect(() => {
    if (!isEditing) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onExitEditMode();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isEditing, onExitEditMode]);

  useEffect(() => {
    if (!isEditing) return;

    const timeout = window.setTimeout(() => {
      if (draftHtml === item.content) return;
      onChangeItem(item.id, { content: draftHtml });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [draftHtml, isEditing, item.content, item.id, onChangeItem]);

  const maybeSyncDefaultStylesFromPopup = (patch: Partial<DefaultTextStyles>) => {
    if (!editor) return;
    const shouldSyncDefaults = editor.state.selection.empty || isFullDocumentSelection(editor);
    if (!shouldSyncDefaults) return;

    skipNextFullContentSyncRef.current = true;
    onChangeItem(item.id, {
      styles: {
        ...item.styles,
        ...patch,
      },
    });
  };

  const applyCustomFontSize = (rawValue: string) => {
    if (!editor) return;
    const normalizedSize = normalizeFontSize(rawValue);

    if (!normalizedSize) {
      const fallback = normalizeFontSize(resolvedFontSize);
      setFontSizeDraft(fallback ? stripPx(fallback) : "");
      return;
    }

    editor.chain().focus().setMark("textStyle", { fontSize: normalizedSize }).run();
    maybeSyncDefaultStylesFromPopup({ fontSize: normalizedSize });
    setFontSizeDraft(stripPx(normalizedSize));
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      const active = document.activeElement;
      if (!active) {
        onExitEditMode();
        return;
      }

      if (contentRef.current?.contains(active)) return;
      if (toolbarRef.current?.contains(active)) return;
      onExitEditMode();
    }, 0);
  };

  const shouldShowToolbar = () => {
    if (!isEditing) return false;

    const active = document.activeElement;
    if (!active) return Boolean(editor?.isFocused);

    const inEditor = contentRef.current?.contains(active) ?? false;
    const inToolbar = toolbarRef.current?.contains(active) ?? false;
    return Boolean(editor?.isFocused) || inEditor || inToolbar;
  };

  const getToolbarAnchor = () => {
    const anchorEl = itemRef.current ?? contentRef.current;
    if (!anchorEl) return null;

    return {
      getBoundingClientRect: () => anchorEl.getBoundingClientRect(),
    };
  };

  if (!editor) {
    return (
      <div style={{ width: "100%", height: "100%", ...item.styles }}>
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>
    );
  }

  return (
    <div ref={itemRef} style={{ width: "100%", height: "100%", ...item.styles }}>
      {isEditing && (
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
                maybeSyncDefaultStylesFromPopup({ fontFamily: e.target.value });
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
              <input
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
                  applyCustomFontSize(e.target.value);
                  setIsFontSizeMenuOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyCustomFontSize(e.currentTarget.value);
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
                className="h-7 w-16 rounded border border-gray-300 px-1 pr-5 text-xs"
                aria-label="Font size combobox in pixels"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setIsFontSizeMenuOpen((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-4 items-center justify-center text-[10px] text-gray-600"
                aria-label="Toggle font size options"
              >
                v
              </button>
              {isFontSizeMenuOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 max-h-32 w-16 overflow-y-auto rounded border border-gray-300 bg-white shadow">
                  {fontSizeChoices.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyCustomFontSize(value);
                        setIsFontSizeMenuOpen(false);
                      }}
                      className="block w-full px-2 py-1 text-left text-xs hover:bg-gray-100"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="color"
              value={resolvedColorHex}
              onChange={(e) => {
                editor.chain().focus().setColor(e.target.value).run();
                maybeSyncDefaultStylesFromPopup({ color: e.target.value });
              }}
              className="h-7 w-8 rounded border border-gray-300 bg-white p-0.5"
            />
            {selectionStyles.color === MIXED_VALUE && (
              <span className="text-[10px] text-gray-500">Mixed</span>
            )}
          </div>
        </BubbleMenu>
      )}

      {isEditing ? (
        <div ref={contentRef} onBlur={handleBlur} className="h-full w-full">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

export function CanvasTextItem(props: CanvasTextItemProps) {
  const { item } = props;
  const isRichTextArea = item.sourceToolId === "text-area";

  if (isRichTextArea) {
    return <RichTextAreaItem {...props} />;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        whiteSpace: "pre-wrap",
        ...item.styles,
      }}
    >
      {item.content}
    </div>
  );
}
