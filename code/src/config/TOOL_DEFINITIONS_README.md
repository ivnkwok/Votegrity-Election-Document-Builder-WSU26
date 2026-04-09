# Tool Definitions Guide

`src/config/tools.ts` is the source of truth for draggable sidebar tools.

## ToolDefinition Shape

```ts
export interface ToolDefinition {
  id: string;
  label: string;
  toolKind?: "canvas-item" | "generator";
  type: "text" | "image" | "box";
  defaultContent?: string;
  imageSrc?: string;
  defaultWidth: number;
  defaultHeight: number;
  flags: {
    isMovable: boolean;
    isEditable: boolean;
    minQuantity: number;
    maxQuantity: number;
  };
  styles?: React.CSSProperties;
}
```

## How It Works

1. Sidebar tools are rendered directly from `TOOL_DEFINITIONS`.
2. `toolKind: "canvas-item"` creates a single canvas item when dropped.
3. `toolKind: "generator"` runs custom drop logic instead of creating a direct item.
4. `flags.maxQuantity` is enforced per page during drop.

## Current Rendering Rules

- `text` uses `CanvasTextItem`
- `image` uses `CanvasImageItem`
- `box` uses `CanvasBoxItem`

## Adding A New Tool

- Add an entry to `TOOL_DEFINITIONS`.
- Use `toolKind: "generator"` only if the tool creates multiple items or runs custom logic.
- Keep `sourceToolId` stable so saved layouts, quantity checks, and tests stay consistent.
- If a tool needs custom generation behavior, update `useCanvasDnd.ts`.

## Example

```ts
{
  id: "grey-box",
  label: "Grey Box",
  type: "box",
  defaultWidth: 200,
  defaultHeight: 120,
  flags: {
    isMovable: true,
    isEditable: false,
    minQuantity: 0,
    maxQuantity: 99,
  },
  styles: {
    backgroundColor: "#e5e7eb",
    border: "1px solid #ccc",
  },
}
```
