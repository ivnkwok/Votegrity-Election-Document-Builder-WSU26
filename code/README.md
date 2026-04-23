# Votegrity Frontend

This directory contains the Vite + React frontend for the Votegrity election document builder.

In production, election and voter data are loaded from the authenticated Helios/docscreator server rather than bundled prototype JSON. The app handles drag-and-drop document editing, multi-page layouts, PDF preview/export, PDF import, rich text editing, and mail merge workflows in the browser.

## Getting Started

### Prerequisites

- Node.js
- npm

### Install and run

```bash
npm install
npm run dev
```

By default, Vite serves the app locally at the address shown in the terminal, usually `http://localhost:5173`.

## Available Commands

```bash
npm run dev
npm run test -- --run
npm run test:ui
npm run lint
npm run build
npm run build:docscreator
npm run build:client
npm run preview
```

- `npm run dev` starts the local Vite development server
- `npm run test -- --run` runs the Vitest suite once in the terminal
- `npm run test:ui` opens the Vitest UI
- `npm run lint` runs ESLint
- `npm run build` builds for `/` and runs the bundle-size check
- `npm run build:docscreator` builds for the current docscreator deployment path, `/docscreator/`
- `npm run build:client` builds using `APP_BASE_PATH`
- `npm run preview` previews the built app locally

## Deployment Base Path

The Vite config reads `APP_BASE_PATH` and normalizes it into the final base path used by the app.

If the app will be hosted under a different subpath, set `APP_BASE_PATH` before running `npm run build:client`.

PowerShell example:

```powershell
$env:APP_BASE_PATH = "/client-doc-builder/"
npm run build:client
```

## Core Workflows

### Election data

- Administered elections are fetched from the authenticated docscreator/Helios server
- Election user data for mail merge is fetched from the selected election when available
- If election loading fails with an auth or redirect-style error, sign in on the server first and reload the app

### Layout editing

- Users can drag tools from the sidebar onto the canvas
- The editor supports multi-page documents with add, duplicate, rename, move, and delete actions
- Layouts can be exported to JSON and loaded back into the app later
- Built-in templates include blank, ballot, notice, and candidate statement layouts

### PDF workflows

- `Open PDF Preview` renders the current document to a letter-sized PDF in the browser
- Existing PDFs can be imported and converted into page images for editing or overlay workflows
- PDF rendering and export stay client-side in the browser

### Mail merge

- Mail merge works with either selected election users or an uploaded voter JSON file
- Templates must contain at least one `Voter Address` or `Voter PIN` component before mail merge can run
- Supported uploaded voter formats include an array of objects, a `voters` array, or `columns` plus `rows`

## Project Structure

- `src/App.tsx`: application shell, election loading, sidebar wiring, and top-level UI state
- `src/hooks/useAppController.ts`: canvas editing, page management, PDF preview, import, and mail merge orchestration
- `src/hooks/useCanvasDnd.ts`: drag-and-drop behavior for tool placement and grouped movement
- `src/components/`: canvas, sidebar, help dialog, PDF import UI, and reusable interface components
- `src/config/tools.ts`: sidebar tool definitions for draggable canvas items
- `src/services/apiService.ts`: live election and voter data fetching
- `src/services/layoutService.ts`: saved layout import/export logic
- `src/services/templateService.ts`: built-in template loading
- `src/services/mailMergeService.ts`: voter parsing, validation, and replacement logic
- `src/services/documentPdfService.ts`: browser-side PDF rendering/export
- `src/test/`: Vitest regression coverage
- `scripts/checkBundleSize.mjs`: post-build bundle size guard
- `ops/`: docscreator deployment and release notes

## Build and Release Notes

- `npm run build` and `npm run build:client` include a bundle-size guard so large chunks do not regress quietly
- Heavy features such as PDF import, rich-text editing, and PDF export are lazy-loaded
- Current docscreator release steps live in:

  - `ops/build-and-copy-to-server.md`
  - `ops/server-commands-to-release.md`

## Troubleshooting

- If administered elections do not load, verify you are signed in to the docscreator/Helios server session
- If mail merge is disabled, confirm a voter source is loaded and the document includes a `Voter Address` or `Voter PIN` component
- If uploaded voter data is rejected, make sure the file is valid JSON and includes the required voter fields
- If PDF import fails, the file may be invalid, corrupted, or password-protected
- If a PDF preview tab does not open, browser popup settings may be interfering

## Notes for Contributors

- The app no longer relies on bundled prototype election data for normal production use
- Q&A generation preserves the source question order from the selected election
- The `@` import alias resolves to `src/`
- Tests run in `jsdom` with setup from `src/test/setupTests.ts`
