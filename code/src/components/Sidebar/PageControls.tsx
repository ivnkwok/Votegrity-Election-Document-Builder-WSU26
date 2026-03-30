import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageControlsProps {
  pageOrder: string[];
  activePageId: string;
  pageNamesById: Record<string, string>;
  switchPage: (nextPageId: string) => void;
  addPage: () => void;
  duplicatePage: () => void;
  deletePage: () => void;
  renamePage: (newName: string, pageId?: string) => void;
  movePage: (pageId: string, delta: -1 | 1) => void;
}

export function PageControls({
  pageOrder,
  activePageId,
  pageNamesById,
  switchPage,
  addPage,
  duplicatePage,
  deletePage,
  renamePage,
  movePage,
}: PageControlsProps) {
  const activePageIndex = useMemo(
    () => pageOrder.indexOf(activePageId),
    [pageOrder, activePageId]
  );

  const canMoveUp = activePageIndex > 0;
  const canMoveDown = activePageIndex >= 0 && activePageIndex < pageOrder.length - 1;
  const currentPageName = pageNamesById[activePageId] ?? "";
  const [pageNameDraft, setPageNameDraft] = useState(currentPageName);

  useEffect(() => {
    setPageNameDraft(currentPageName);
  }, [currentPageName]);

  const commitPageName = () => {
    const clean = pageNameDraft.trim();
    if (!clean) {
      setPageNameDraft(currentPageName);
      return;
    }

    renamePage(pageNameDraft, activePageId);
    setPageNameDraft(clean);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Page</div>

      <Select value={activePageId} onValueChange={switchPage}>
        <Input
          value={pageNameDraft}
          placeholder="Rename page"
          onChange={(e) => setPageNameDraft(e.target.value)}
          onBlur={commitPageName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitPageName();
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              setPageNameDraft(currentPageName);
              e.currentTarget.blur();
            }
          }}
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => movePage(activePageId, -1)}
            disabled={!canMoveUp}
          >
            Move Up
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            onClick={() => movePage(activePageId, 1)}
            disabled={!canMoveDown}
          >
            Move Down
          </Button>
        </div>

        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select page" />
        </SelectTrigger>
        <SelectContent>
          {pageOrder.map((pageId) => (
            <SelectItem key={pageId} value={pageId}>
              {pageNamesById[pageId] ?? pageId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={addPage}>
          + Add
        </Button>
        <Button variant="outline" className="flex-1" onClick={duplicatePage}>
          Duplicate
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={deletePage}
        disabled={pageOrder.length <= 1}
      >
        Delete Page
      </Button>
    </div>
  );
}
