import { DraggableTool } from "@/components/Tool";
import type { ToolDefinition } from "@/config/tools";

interface SidebarToolsProps {
  tools: ToolDefinition[];
}

export function SidebarTools({ tools }: SidebarToolsProps) {
  return (
    <div className="py-5 grid grid-cols-2 gap-3 pt-3">
      {tools.map((tool) => (
        <DraggableTool
          key={tool.id}
          id={tool.id}
          toolText={tool.label}
        />
      ))}
    </div>
  );
}
