import { Button } from "@/components/ui/button";

interface ToolbarButtonProps {
  active?: boolean;
  label: string;
  onClick: () => void;
}

export function ToolbarButton({ active, label, onClick }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-7 px-2 text-xs ${
        active
          ? "border-blue-600 bg-blue-100 text-blue-900 hover:bg-blue-100"
          : "border-gray-300 bg-white text-gray-700"
      }`}
    >
      {label}
    </Button>
  );
}
