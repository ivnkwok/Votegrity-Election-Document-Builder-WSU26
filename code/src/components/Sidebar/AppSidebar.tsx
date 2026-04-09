import { Suspense, lazy } from "react";
import type { CanvasItem } from "@/lib/utils";
import type { ToolDefinition } from "@/config/tools";
import { Button } from "@/components/ui/button";
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

const PdfUploader = lazy(async () => {
  const module = await import("@/components/PdfUploader");
  return { default: module.PdfUploader };
});

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
  voterListOptions: SidebarSelectOption[];
  selectedVoterList: string;
  uploadedVoterListName: string | null;
  canRunMailMerge: boolean;
  isMailMerging: boolean;
  toolStatusMessage: string | null;
  onSelectedVoterListChange: (value: string) => void;
  onUploadVoterList: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRunMailMerge: () => void;
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
  voterListOptions,
  selectedVoterList,
  uploadedVoterListName,
  canRunMailMerge,
  isMailMerging,
  toolStatusMessage,
  onSelectedVoterListChange,
  onUploadVoterList,
  onRunMailMerge,
  selectedItem,
  onChangeItem,
  onDeleteItem,
}: AppSidebarProps) {
  return (
    <aside className="flex h-full w-[380px] shrink-0 overflow-hidden border-r border-gray-300 bg-white">
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto p-4">
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
          <div className="text-sm font-medium text-gray-700">Drag-and-Drop Components</div>
          <hr />
          <SidebarTools tools={tools} />
          <hr />
          {toolStatusMessage && (
            <div
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
              role="status"
              aria-live="polite"
            >
              {toolStatusMessage}
            </div>
          )}
        </div>
        <Suspense
          fallback={
            <Button variant="outline" className="w-full" disabled>
              Loading PDF Importer...
            </Button>
          }
        >
          <PdfUploader onPdfPagesExtracted={onPdfPagesExtracted} />
        </Suspense>

        <SidebarActions
          onSave={onSave}
          onLoad={onLoad}
          onPreview={onPreview}
          voterListOptions={voterListOptions}
          selectedVoterList={selectedVoterList}
          uploadedVoterListName={uploadedVoterListName}
          canRunMailMerge={canRunMailMerge}
          isMailMerging={isMailMerging}
          onSelectedVoterListChange={onSelectedVoterListChange}
          onUploadVoterList={onUploadVoterList}
          onRunMailMerge={onRunMailMerge}
        />

        <PropertiesPanel item={selectedItem} onChange={onChangeItem} onDelete={onDeleteItem}/>
      </div>
    </aside>
  );
}
