import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { TEXT_FONT_FAMILIES, TEXT_FONT_SIZES } from "@/lib/textStyleOptions";
import { getSelectionStyleState, isFullDocumentSelection } from "./selectionStyles";
import {
  deriveDefaultTextStyles,
  normalizeFontSize,
  stripPx,
  toHexColor,
  withMixedOption,
} from "./styleHelpers";
import { RICH_TEXT_EXTENSIONS } from "./tiptapExtensions";
import { RichTextToolbar } from "./RichTextToolbar";
import { MIXED_VALUE, type CanvasTextItemProps, type DefaultTextStyles } from "./types";

export function RichTextAreaItem({
  item,
  isEditing,
  onChangeItem,
  onExitEditMode,
}: CanvasTextItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const skipNextFullContentSyncRef = useRef(false);

  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(item.content ?? "<p></p>"), [item.content]);
  const [draftHtml, setDraftHtml] = useState<string>(sanitizedHtml);

  const defaultStyles = useMemo(() => deriveDefaultTextStyles(item.styles), [item.styles]);
  const lastDefaultStylesRef = useRef<DefaultTextStyles>(defaultStyles);

  const editor = useEditor(
    {
      extensions: RICH_TEXT_EXTENSIONS,
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
      selector: ({ editor: activeEditor }) => (activeEditor ? getSelectionStyleState(activeEditor) : null),
    }) ?? { fontFamily: null, fontSize: null, color: null };

  const resolvedFontFamily =
    selectionStyles.fontFamily === MIXED_VALUE
      ? MIXED_VALUE
      : selectionStyles.fontFamily ?? defaultStyles.fontFamily;

  const resolvedFontSize =
    selectionStyles.fontSize === MIXED_VALUE ? MIXED_VALUE : selectionStyles.fontSize ?? defaultStyles.fontSize;

  const resolvedColorCss =
    selectionStyles.color === MIXED_VALUE
      ? defaultStyles.color
      : selectionStyles.color ?? defaultStyles.color;

  const resolvedColorHex = toHexColor(resolvedColorCss, "#000000");

  const fontFamilyOptions = useMemo(
    () => withMixedOption([...TEXT_FONT_FAMILIES], resolvedFontFamily),
    [resolvedFontFamily]
  );

  const fontSizeChoices = useMemo(() => {
    const base = TEXT_FONT_SIZES.map((size) => String(size));
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
        <RichTextToolbar
          editor={editor}
          isEditing={isEditing}
          itemRef={itemRef}
          contentRef={contentRef}
          toolbarRef={toolbarRef}
          selectionStyles={selectionStyles}
          resolvedFontFamily={resolvedFontFamily}
          resolvedFontSize={resolvedFontSize}
          resolvedColorHex={resolvedColorHex}
          fontFamilyOptions={fontFamilyOptions}
          fontSizeChoices={fontSizeChoices}
          fontSizeDraft={fontSizeDraft}
          setFontSizeDraft={setFontSizeDraft}
          isFontSizeMenuOpen={isFontSizeMenuOpen}
          setIsFontSizeMenuOpen={setIsFontSizeMenuOpen}
          onApplyCustomFontSize={applyCustomFontSize}
          onSyncDefaultStyles={maybeSyncDefaultStylesFromPopup}
        />
      )}

      {isEditing ? (
        <div ref={contentRef} onBlur={handleBlur} className="h-full w-full">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <div
          data-testid="rich-text-preview"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          style={{
            width: "100%",
            height: "100%",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
