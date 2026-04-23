import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VoterListOption {
  value: string;
  label: string;
}

interface SidebarActionsProps {
  onSave: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreview: () => void;
  voterListOptions: VoterListOption[];
  selectedVoterList: string;
  uploadedVoterListName: string | null;
  canRunMailMerge: boolean;
  isMailMerging: boolean;
  onSelectedVoterListChange: (value: string) => void;
  onUploadVoterList: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRunMailMerge: () => void;
}

export function SidebarActions({
  onSave,
  onLoad,
  onPreview,
  voterListOptions,
  selectedVoterList,
  uploadedVoterListName,
  canRunMailMerge,
  isMailMerging,
  onSelectedVoterListChange,
  onUploadVoterList,
  onRunMailMerge,
}: SidebarActionsProps) {
  const needsUpload = selectedVoterList === "upload";

  return (
    <div className="mt-4 flex flex-col gap-2">
      <Button variant="outline" onClick={onSave}>
        Save Template
      </Button>

      <Button variant="outline" asChild>
        <label className="cursor-pointer">
          Load Template
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

      <div className="mt-2 rounded-md border border-gray-200 p-3">
        <div className="mb-2 text-sm font-medium text-gray-700">Mail Merge</div>
        <div className="mb-1 text-xs text-gray-500">Voter List Source</div>
        <Select value={selectedVoterList} onValueChange={onSelectedVoterListChange}>
          <SelectTrigger className="mb-2 w-full" aria-label="Voter List Source">
            <SelectValue placeholder="Choose voter list source" />
          </SelectTrigger>
          <SelectContent>
            {voterListOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {needsUpload && (
          <Button variant="outline" className="mb-2 w-full" asChild>
            <label className="cursor-pointer text-center">
              Upload Voter JSON
              <input
                type="file"
                accept="application/json"
                onChange={onUploadVoterList}
                className="hidden"
              />
            </label>
          </Button>
        )}

        {uploadedVoterListName && (
          <div className="mb-2 truncate text-xs text-gray-500">
            Loaded: {uploadedVoterListName}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={onRunMailMerge}
          disabled={!canRunMailMerge || isMailMerging}
        >
          {isMailMerging ? "Generating Mail Merge..." : "Run Mail Merge PDF"}
        </Button>
      </div>
    </div>
  );
}
