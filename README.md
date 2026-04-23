# Web-Based Election Document Builder

## Project Summary

### One-sentence description of the project

An intuitive, web-based election document builder that allows Votegrity staff to quickly create, edit, preview, and export personalized election documents through a drag-and-drop interface.

### Additional information about the project

Votegrity provides voting services for HOAs, unions, and other organizations. As the company grows, it faces challenges in generating customized election documents efficiently. This project provides a web-based editor that simplifies and speeds up document creation using reusable components, preset templates, live election data, layout saving/loading, and browser-based PDF generation.

The current frontend lives in the `code/` directory and is designed to support both local development and deployment under the Votegrity docscreator environment.

## Installation

### Prerequisites

Ensure the following tools are installed before proceeding:

- **Git** (>= 2.30)
- **Node.js** and **npm** (npm >= 9.0 recommended)
- (Optional) **VS Code** with the **ESLint** and **Prettier** extensions for development convenience

You can verify installation using:

```bash
git --version
node --version
npm --version
```

### Add-ons

This project uses the following core libraries and add-ons:

- **React** - Frontend library for building UI components
- **TypeScript** - Adds static typing for maintainability and clarity
- **Vite** - Fast development server and bundler
- **Tailwind CSS** - Utility-first styling framework
- **@dnd-kit/core** - Drag-and-drop interactions on the canvas
- **html2canvas-pro** and **jsPDF** - Client-side PDF preview/export
- **pdfjs-dist** - PDF page import support
- **Tiptap** - Rich text editing for text-area components
- **shadcn/ui** and **Radix UI** - Reusable UI primitives and controls

### Installation Steps

You can set up the project locally by following these steps:

```bash
# 1. Clone the repository
git clone https://github.com/ivnkwok/WSU-Capstone-2025.git

# 2. Navigate into the frontend app
cd WSU-Capstone-2025/code

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Then open your browser and navigate to the address shown in the terminal, usually `http://localhost:5173`.

### Common Scripts

From the `code/` directory:

```bash
npm run dev
npm run test -- --run
npm run build
npm run build:docscreator
npm run build:client
npm run lint
npm run preview
```

- `npm run build` creates a production bundle for `/` and runs the bundle-size check
- `npm run build:docscreator` builds for the deployed docscreator path (`/docscreator/`)
- `npm run build:client` can be used with `APP_BASE_PATH` for a different subpath deployment

PowerShell example:

```powershell
$env:APP_BASE_PATH = "/client-doc-builder/"
npm run build:client
```

### Saving and Loading Templates

The app supports both built-in templates and saved custom layouts:

- **Built-in templates**: Blank Layout, Ballot Template, Notice Template, and Candidate Statement Template
- **Save Layout**: Exports the current multi-page layout as a JSON file named `canvasDocument.json`
- **Load Layout**: Restores a previously exported layout file

To test this flow:

1. Drag components onto the canvas or start from a built-in template.
2. Click **Save Layout** to export the current document.
3. Refresh the page or clear your work.
4. Click **Load Layout** and select the saved JSON file.

## Functionality

This application includes the following major features:

1. **Drag-and-Drop Document Builder** - Users can drag predefined components such as text blocks, return address fields, logos, uploaded images, voter address placeholders, voter PIN placeholders, and Q&A blocks onto the page.
2. **Template System** - Provides preset layouts for common document types including ballots, candidate statements, notices, and blank documents.
3. **Multi-Page Editing** - Supports adding, duplicating, renaming, reordering, deleting, and switching between pages.
4. **Rich Editing Controls** - Allows users to edit content, resize components, update position and dimensions, and adjust text styling from the properties panel.
5. **PDF Preview and Export** - Generates letter-sized PDFs directly in the browser for preview or download.
6. **PDF Page Import** - Lets users import an existing PDF and turn its pages into canvas pages for further editing or overlay work.
7. **Live Election Integration** - Loads administered elections and election user data from the authenticated Votegrity docscreator/Helios environment.
8. **Mail Merge** - Generates merged PDFs using either the selected election's voter list or an uploaded voter JSON file.
9. **Q&A Generation** - Creates question-and-answer content blocks from the selected election while preserving source question order.

### Hidden functionality

- **Pixel Nudge** - Select a dropped item and use the arrow keys to move it by 1px. Hold **Shift** while nudging to move by 10px.
- **Multi-Select** - Use **Shift + Click** or **Ctrl/Cmd + Click** to select multiple components at once.
- **Rich Text Shortcut** - Double-click a text area to enter rich-text editing mode, then press **Escape** to exit quickly.

### Walkthrough

1. Open the app in your browser.
2. If you want live election data, make sure you are signed in to the docscreator/Helios environment first.
3. Select a built-in template or start with a blank layout.
4. Optionally choose an election so Q&A blocks and election users are available.
5. Drag elements from the sidebar onto the canvas.
6. Adjust layout, styling, and page structure as desired.
7. Click **Open PDF Preview** to generate a browser preview of the document.
8. If needed, choose a voter list source and click **Run Mail Merge PDF** to generate voter-specific output.
9. Use **Save Layout** to export the editable layout JSON for later reuse.

## Known Problems

- Live election loading depends on an authenticated docscreator/Helios session. If the session is missing or expired, election data and voter lists may fail to load.
- Uploaded voter data must be valid JSON in a supported format such as an array of objects, a `voters` array, or `columns` plus `rows`.
- PDF import may fail for corrupted or password-protected files.
- Browser popup settings can affect how PDF preview opens. If a new tab is blocked, the app falls back to file download behavior.

## Project Structure

```text
WSU-Capstone-2025/
|- README.md
|- code/        # Vite + React frontend application
|- data/        # Sample data and reference JSON
|- docs/        # Reports, presentations, and project documentation
|- resources/   # Supporting project resources
`- tests/       # Additional testing materials
```

## Additional Documentation

- `code/README.md` - Frontend-specific developer notes and commands
- `code/ops/build-and-copy-to-server.md` - Local build and packaging steps for docscreator releases
- `code/ops/server-commands-to-release.md` - Server-side release commands
- `docs/FRAMEWORKS.md` - Project framework notes
- `docs/Reports/` - Project reports, requirements, and specifications
- `docs/PresentationsVideos/` - Sprint demos and presentation recordings

