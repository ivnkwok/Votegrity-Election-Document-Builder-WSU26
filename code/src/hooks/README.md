# Hooks Directory

Contains the core business logic and state management for the application.

## Subdirectories
* **`appController/`**: Logic for multi-page state management (`usePageState.ts`) and page-level utilities.
* **`canvasDnd/`**: Specialized logic for drag-and-drop operations, including coordinate clamping and item creation factories.

## Key Hooks
* **`useAppController.ts`**: The primary coordinator for selection, file I/O, and triggering PDF generation.
* **`useCanvasDnd.ts`**: Manages the lifecycle of drag events and updates the canvas state upon dropping new items.
* **`useKeyboardMovement.ts`**: Provides accessibility and power-user features for moving selected items with arrow keys.