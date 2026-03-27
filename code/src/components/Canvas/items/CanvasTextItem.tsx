import { RichTextAreaItem } from "./text/RichTextAreaItem";
import type { CanvasTextItemProps } from "./text/types";

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
