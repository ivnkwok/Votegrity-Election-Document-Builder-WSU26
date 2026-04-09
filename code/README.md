# Votegrity Frontend

This directory contains the Vite + React frontend for the Votegrity election document builder.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run test -- --run
npm run build
```

## What Lives Here

- `src/App.tsx`: application shell and top-level state wiring
- `src/hooks/useAppController.ts`: canvas, page, export, and mail-merge orchestration
- `src/components/`: sidebar, canvas, PDF import, and rich-text UI
- `src/services/`: layout, template, mail-merge, and PDF export services
- `src/test/`: Vitest regression coverage

## Notes

- `npm run build` includes a bundle-size guard so large chunks do not regress quietly.
- PDF preview and mail merge stay fully client-side.
- Heavy features such as PDF import, rich-text editing, and PDF export are lazy-loaded.
