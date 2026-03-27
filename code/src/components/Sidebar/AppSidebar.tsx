import type { CanvasItem } from "@/lib/utils";
import type { ToolDefinition } from "@/config/tools";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarActions } from "@/components/Sidebar/SidebarActions";
import { SidebarTools } from "@/components/Sidebar/SidebarTools";
import { PropertiesPanel } from "@/components/Sidebar/PropertiesPanel";
import { PageControls } from "@/components/Sidebar/PageControls";
import { PdfUploader } from "@/components/PdfUploader";

interface ElectionOption {
  value: string;
  label: string;
}

interface AppSidebarProps {
  tools: ToolDefinition[];
  electionOptions: ElectionOption[];
  selectedElection: string;
  onSelectedElectionChange: (value: string) => void;
  pageOrder: string[];
  activePageId: string;
  pageNamesById: Record<string, string>;
  switchPage: (nextPageId: string) => void;
  addPage: () => void;
  duplicatePage: () => void;
  deletePage: () => void;
  renamePage: (newName: string, pageId?: string) => void;
  movePage: (pageId: string, delta: -1 | 1) => void;
  onPdfPagesExtracted: (images: { dataUrl: string; pageNumber: number }[]) => void;
  onSave: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreview: () => void;
  selectedItem: CanvasItem | undefined;
  onChangeItem: (id: string, updates: Partial<CanvasItem>) => void;
}

export function AppSidebar({
  tools,
  electionOptions,
  selectedElection,
  onSelectedElectionChange,
  pageOrder,
  activePageId,
  pageNamesById,
  switchPage,
  addPage,
  duplicatePage,
  deletePage,
  renamePage,
  movePage,
  onPdfPagesExtracted,
  onSave,
  onLoad,
  onPreview,
  selectedItem,
  onChangeItem,
}: AppSidebarProps) {
  return (
    <div className="flex h-screen w-[380px] flex-col border-r border-gray-300 bg-white">
      <div className="flex-1 space-y-6 p-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Election Data</div>
          <Select value={selectedElection} onValueChange={onSelectedElectionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Election" />
            </SelectTrigger>

            <SelectContent>
              {electionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ballot Template">Ballot Template</SelectItem>
            <SelectItem value="Notice Template">Notice Template</SelectItem>
            <SelectItem value="Candidate Statement Template">Candidate Statement Template</SelectItem>
          </SelectContent>
        </Select>

        <PageControls
          pageOrder={pageOrder}
          activePageId={activePageId}
          pageNamesById={pageNamesById}
          switchPage={switchPage}
          addPage={addPage}
          duplicatePage={duplicatePage}
          deletePage={deletePage}
          renamePage={renamePage}
          movePage={movePage}
        />

        <SidebarTools tools={tools} />
        <PdfUploader onPdfPagesExtracted={onPdfPagesExtracted} />

        <SidebarActions onSave={onSave} onLoad={onLoad} onPreview={onPreview} />

        <PropertiesPanel item={selectedItem} onChange={onChangeItem} />
      </div>
    </div>
  );
}
