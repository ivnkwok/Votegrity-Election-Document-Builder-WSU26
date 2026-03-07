// config/tools.ts

// Defines the available tools/components that can be added to the canvas (from the LHS palette) 
export interface ToolDefinition {
  id: string;
  label: string;
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

// List of tool definitions (can be expanded as neeeded, read /config/TOOL_DEFINITIONS_README.md for details)
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: "candidate-name",
    label: "Candidate Name",
    type: "text",
    defaultContent: "Candidate Name",
    defaultWidth: 250,
    defaultHeight: 40,
    flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 999 },
    styles: { fontSize: 20, fontWeight: 600 },
  },
  {
    id: "candidate-body",
    label: "Candidate Body",
    type: "text",
    defaultContent: "Lorem ipsum candidate bio here...",
    defaultWidth: 350,
    defaultHeight: 120,
    flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 999 },
    styles: { fontSize: 14, lineHeight: "1.4" },
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
    imageSrc: "/votegrity-logo.png",
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
    label:"Q&A",
    type: "box",
    defaultWidth: 200,
    defaultHeight: 60,
    flags: { isMovable: true, isEditable: true, minQuantity: 1, maxQuantity: 1},
  },
];