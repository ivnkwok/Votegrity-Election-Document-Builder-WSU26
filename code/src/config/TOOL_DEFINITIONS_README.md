# Tool Definitions Guide  
This document explains how the tool-definition system works inside the `config/` directory, and how to create new tools for the canvas-based document builder.

The file `tools.ts` contains a declarative list of **ToolDefinitions**, which describe all draggable components shown in the left-hand palette of the application.

The canvas uses these definitions to automatically generate items when the user drags a tool onto the page.

---

## What Is a ToolDefinition?

A tool is a JSON-like configuration object describing:

- what type of item it is (`text`, `image`, or `box`)
- what default content it has
- how large it should be
- whether it can be moved or edited
- optional styling applied when rendered

Every tool must match this interface:

```ts
export interface ToolDefinition {
  id: string;                     // Unique internal ID
  label: string;                  // Name shown in the palette
  type: "text" | "image" | "box"; // Determines how the tool is rendered on the canvas

  defaultContent?: string;        // Only for text items
  imageSrc?: string;              // Only for image items

  defaultWidth: number;           // Initial width on canvas
  defaultHeight: number;          // Initial height on canvas

  flags: {
    isMoveable: boolean;          // Can the user drag it?
    isEditable: boolean;          // Can the content be edited?
    minQuantity: number;          // Minimum allowed on the canvas
    maxQuantity: number;          // Maximum allowed on the canvas
  };

  styles?: React.CSSProperties;   // Optional styles (font size, alignment, etc.)
}
```

---

## Where Tools Are Defined

All available tools are listed in:

```
config/tools.ts
```

They are stored as an array:

```ts
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  { ... },
  { ... },
  ...
];
```

Each entry corresponds to one draggable tool in the left palette.

---

## How Tools Are Used in the Application

When a user drags a tool from the palette onto the canvas:

1. The tool definition is looked up using its `id`.
2. A new `CanvasItem` is created using:
   - `defaultContent` or `imageSrc`
   - default width/height
   - styling from the `styles` field
   - behavior from the `flags` field  
3. The renderer automatically chooses the correct component:
   - `"text"` → `CanvasTextItem`
   - `"image"` → `CanvasImageItem`
   - `"box"` → (reserved for layout items or backgrounds)

This setup keeps the canvas generic while allowing tools to be fully customizable.

---

## Adding a New Tool

To define a new tool, simply append a new object to the `TOOL_DEFINITIONS` array.

### Example: A Section Header Text Block

```ts
{
  id: "section-header",
  label: "Section Header",
  type: "text",
  defaultContent: "Section Title",
  defaultWidth: 300,
  defaultHeight: 50,
  flags: {
    isMoveable: true,
    isEditable: true,
    minQuantity: 0,
    maxQuantity: 99
  },
  styles: {
    fontSize: 22,
    fontWeight: 700
  }
}
```

---

### Example: A Decorative Divider Image

```ts
{
  id: "divider-line",
  label: "Divider Line",
  type: "image",
  imageSrc: "/assets/divider.png",
  defaultWidth: 400,
  defaultHeight: 20,
  flags: {
    isMoveable: true,
    isEditable: false,
    minQuantity: 0,
    maxQuantity: 99
  }
}
```

---

### Example: A Simple Colored Box

```ts
{
  id: "grey-box",
  label: "Grey Box",
  type: "box",
  defaultWidth: 200,
  defaultHeight: 120,
  flags: {
    isMoveable: true,
    isEditable: false,
    minQuantity: 0,
    maxQuantity: 99
  },
  styles: {
    backgroundColor: "#e5e7eb",
    border: "1px solid #ccc"
  }
}
```

---

## Design Principles

- **Declarative by design** — tools require no React code changes.
- **Automatic rendering** — the renderer chooses components based on `type`.
- **Consistent behavior** — movement, resizing, and editing are unified.
- **Easily extendable** — new tools require only a new entry in `TOOL_DEFINITIONS`.

---

## Summary

The tool-definition system allows the application to scale quickly and stay maintainable.  
Every draggable tool is defined entirely within `config/tools.ts`, making it easy to:

- add new component types  
- modify styling or defaults  
- enforce quantity limits  
- reuse tools across templates  

No canvas rendering logic needs to be modified when adding a tool.

