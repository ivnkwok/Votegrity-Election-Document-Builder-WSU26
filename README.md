# Web-Based Election Document Builder

## Project Summary

### One-sentence description of the project

An intuitive, web-based election document builder that allows Votegrity staff to quickly create, edit, and export personalized election documents through a drag-and-drop interface.

### Additional information about the project

Votegrity provides voting services for HOAs, unions, and other organizations. As the company grows, it faces challenges in generating customized election documents efficiently. This project provides a web-based editor that simplifies and speeds up the creation of these documents using reusable components, customizable templates, and PDF export functionality. The tool enhances scalability and streamlines document workflows by reducing manual formatting work.

## Installation

### Prerequisites

Ensure the following tools are installed on your machine before proceeding:

- **Git** (≥ 2.30)
- **npm** (≥ 9.0)
- (Optional) **VS Code** with the **ESLint** and **Prettier** extensions for development convenience

You can verify installation using:

```bash
git --version
npm --version
```

### Add-ons

This project uses the following core libraries and add-ons:

- **React** — Frontend library for building UI components.
- **TypeScript** — Adds static typing to JavaScript for maintainability and clarity.
- **Vite** — Lightweight and fast development server and bundler.
- **Tailwind CSS** — Utility-first CSS framework for responsive and modern styling.
- **@dnd-kit/core** — Provides drag-and-drop functionality for UI components.
- **html2canvas-pro** and **jsPDF** — Enable client-side PDF export from HTML content.
- **shadcn/ui** — Prebuilt, composable UI components styled with Tailwind.

### Installation Steps

You can set up the project locally by following these steps:

```bash
# 1. Clone the repository
git clone https://github.com/ivnkwok/WSU-Capstone-2025.git

# 2. Navigate into the project directory
cd ./code

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Then, open your browser and navigate to the address shown in the terminal (usually `http://localhost:5173`).

### Saving and Loading Templates

You can test saving and loading templates by dragging components from the canvas, clicking **Save Template** on the webpage, refreshing the page, and clicking **Load Template** to load the previously saved template.

## Functionality

This application includes the following major features:

1. **Drag-and-Drop Document Builder** — Users can drag predefined document components (e.g., candidate name, return address, logos) onto a page.
2. **Template System** — Provides preset layouts for different document types (e.g., ballots, candidate statements, notices).
3. **PDF Export** — Generates downloadable or previewable PDF versions of the created election documents.
4. **User Interface Controls** — Allows resizing, positioning, and removing components dynamically.
5. **Customization Options** — TODO: Add specifics like color changes, text editing, or data binding if implemented.

### Hidden functionality

* **Pixel Nudge** — Users can select a dropped item on the canvas and use the arrow keys (up, down, left, right) to nudge the component around the canvas. Hold **shift** while nudging to increase pixel movement amount from 1px -> 10px

### Walkthrough

1. Open the app in your browser.
2. Select a document type or start with a blank canvas.
3. Drag elements from the sidebar (e.g., Votegrity logo, candidate photo) onto the canvas.
4. Adjust layout as desired.
5. Click “Export to PDF” to generate the final document.

## Known Problems

## Additional Documentation