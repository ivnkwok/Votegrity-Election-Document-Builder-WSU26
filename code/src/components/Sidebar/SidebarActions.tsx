import { Button } from "@/components/ui/button";

interface SidebarActionsProps {
  onSave: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreview: () => void;
}

export function SidebarActions({ onSave, onLoad, onPreview }: SidebarActionsProps) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <Button variant="outline" onClick={onSave}>
        Save Layout
      </Button>

      <Button variant="outline" asChild>
        <label className="cursor-pointer">
          Load Layout
          <input
            type="file"
            accept="application/json"
            onChange={onLoad}
            className="hidden"
          />
        </label>
      </Button>

      <Button variant="outline" onClick={onPreview}>
        Open PDF Preview
      </Button>
    </div>
  );
}
