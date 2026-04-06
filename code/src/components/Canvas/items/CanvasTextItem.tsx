import { lazy, Suspense, useEffect, useMemo, type CSSProperties } from "react";
import DOMPurify from "dompurify";
import type { CanvasTextItemProps } from "./text/types";

const RichTextAreaItem = lazy(async () => {
  const module = await import("./text/RichTextAreaItem");
  return { default: module.RichTextAreaItem };
});

function RichTextPreview({ html, styles }: { html: string; styles: CSSProperties | undefined }) {
  return (
    <div style={{ width: "100%", height: "100%", ...styles }}>
      <div
        data-testid="rich-text-preview"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          width: "100%",
          height: "100%",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export function CanvasTextItem(props: CanvasTextItemProps) {
  const { item, isEditing, onExitEditMode } = props;
  const isRichTextArea = item.sourceToolId === "text-area";
  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(item.content ?? "<p></p>"), [item.content]);

  useEffect(() => {
    if (!isRichTextArea || !isEditing) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onExitEditMode();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isEditing, isRichTextArea, onExitEditMode]);

  if (isRichTextArea) {
    if (!isEditing) {
      return <RichTextPreview html={sanitizedHtml} styles={item.styles} />;
    }

    return (
      <Suspense fallback={<RichTextPreview html={sanitizedHtml} styles={item.styles} />}>
        <RichTextAreaItem {...props} />
      </Suspense>
    );
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
