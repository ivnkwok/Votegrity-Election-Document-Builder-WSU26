# Components Directory

This folder contains the React components responsible for the application's user interface, organized by functional area.

## Subdirectories

* **`Canvas/`**: The main workspace. Includes `Canvas.tsx` for layout and `CanvasItemRenderer.tsx` for delegating to specific item types.
* **`Sidebar/`**: Navigation and control center. Contains `AppSidebar.tsx`, `PageControls.tsx`, and the `PropertiesPanel.tsx` for editing selected items.
* **`pdfUploader/`**: Handles PDF ingestion, converting document pages into canvas background images using web workers.
* **`ui/`**: Reusable, low-level design system components like `Button`, `Input`, `Dialog`, and `Select`.

## Key Files
* **`Draggable.tsx` / `Droppable.tsx`**: Wrapper components for `@dnd-kit` integration.
* **`Tool.tsx`**: Represents an individual draggable tool in the sidebar.