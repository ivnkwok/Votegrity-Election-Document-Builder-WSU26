# Services Directory

Handles infrastructure-level side effects, such as file processing and document generation.

## Key Services
* **`layoutService.ts`**: Manages saving and loading the custom `.json` document format (v3.0.0), including schema validation.
* **`mailMergeService.ts`**: The engine for mapping voter data to canvas components and validating data integrity.
* **`documentPdfService.ts`**: Orchestrates the conversion of canvas pages into downloadable PDF files.
* **`templateService.ts`**: Handles the fetching and parsing of pre-defined layout templates.