// config/tools.ts

// Defines the available tools/components that can be added to the canvas (from the LHS palette) 
export interface ToolDefinition {
  id: string;
  label: string;
  toolKind?: "canvas-item" | "generator";
  type: "text" | "image" | "box";
  defaultContent?: string;       // for text items
  imageSrc?: string;             // for image items
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

const BASE_URL = import.meta.env.BASE_URL;

// List of tool definitions (can be expanded as needed, read /config/TOOL_DEFINITIONS_README.md for details)
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: "text-body",
    label: "Text Body",
    type: "text",
    defaultContent: "Text Body",
    defaultWidth: 250,
    defaultHeight: 40,
    flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 999 },
    styles: { fontSize: 20, fontWeight: 600 },
  },
  {
    id: "text-area",
    label: "Text Area",
    type: "text",
    defaultContent: "<p>Lorem ipsum text here...</p>",
    defaultWidth: 350,
    defaultHeight: 120,
    flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 999 },
    styles: { fontFamily: "Arial", fontSize: "14px", color: "#000000", lineHeight: "1.4" },
  },
  {
    id: "return-address",
    label: "Return Address",
    type: "text",
    defaultContent: "1234 Main St\nCity, State ZIP",
    defaultWidth: 200,
    defaultHeight: 60,
    flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 1 },
    styles: { fontSize: 14 },
  },
  {
    id: "votegrity-logo",
    label: "Votegrity Logo",
    type: "image",
    imageSrc: `${BASE_URL}votegrity-logo.png`,
    defaultWidth: 160,
    defaultHeight: 90,
    flags: { isMovable: true, isEditable: false, minQuantity: 1, maxQuantity: 1 },
  },
  {
    id: "upload-test",
    label: "Upload Test",
    type: "image",
    imageSrc: "",
    defaultWidth: 160,
    defaultHeight: 90,
    flags: { isMovable: true, isEditable: true, minQuantity: 1, maxQuantity: 1 },
  },
  {
    id: "question-answer",
    label: "Q&A",
    toolKind: "generator",
    type: "box",
    defaultWidth: 200,
    defaultHeight: 60,
    flags: { isMovable: true, isEditable: true, minQuantity: 1, maxQuantity: 1 },
  },
  {
    id: "voter-address",
    label: "Voter Address",
    type: "text",
    defaultContent: "{{VOTER_ADDRESS}}",
    defaultWidth: 240,
    defaultHeight: 110,
    flags: { isMovable: true, isEditable: false, minQuantity: 0, maxQuantity: 999 },
    styles: { fontSize: 14, whiteSpace: "pre-wrap" },
  },
  {
    id: "voter-pin",
    label: "Voter PIN",
    type: "text",
    defaultContent: "{{VOTER_PIN}}",
    defaultWidth: 180,
    defaultHeight: 40,
    flags: { isMovable: true, isEditable: false, minQuantity: 0, maxQuantity: 999 },
    styles: { fontSize: 14, fontWeight: 600 },
  },
];
