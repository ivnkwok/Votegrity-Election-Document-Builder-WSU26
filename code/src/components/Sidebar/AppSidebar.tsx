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

interface SidebarSelectOption {
  value: string;
  label: string;
}

interface AppSidebarProps {
  tools: ToolDefinition[];
  electionOptions: SidebarSelectOption[];
  templateOptions: SidebarSelectOption[];
  selectedElection: string;
  onSelectedElectionChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
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
  onDeleteItem: () => void;
}

export function AppSidebar({
  tools,
  electionOptions,
  templateOptions,
  selectedElection,
  onSelectedElectionChange,
  onTemplateChange,
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
  onDeleteItem,
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
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Starting Template</div>
          <Select onValueChange={onTemplateChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Templates" />
            </SelectTrigger>
            <SelectContent>
              {templateOptions.map((template) => (
                <SelectItem key={template.value} value={template.value}>
                  {template.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Drag-and-Droppable Components</div><hr></hr>
          <SidebarTools tools={tools} />
          <hr></hr>
        </div>
        <PdfUploader onPdfPagesExtracted={onPdfPagesExtracted} />

        <SidebarActions onSave={onSave} onLoad={onLoad} onPreview={onPreview} />

        <PropertiesPanel item={selectedItem} onChange={onChangeItem} onDelete={onDeleteItem}/>
      </div>
    </div>
  );
}
