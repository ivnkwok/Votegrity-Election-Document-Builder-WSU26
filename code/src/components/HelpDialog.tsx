import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Open help">
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to use the Document Builder</DialogTitle>
          <DialogDescription>
            Quick tips for editing faster and avoiding common mistakes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-gray-200 p-3">
            <div className="font-semibold text-gray-900">Canvas basics</div>
            <p className="mt-1 text-gray-700">
              Drag components from the left sidebar onto the page. Click any component to select it.
            </p>
          </div>

          <div className="rounded-md border border-gray-200 p-3">
            <div className="font-semibold text-gray-900">Selection and movement</div>
            <div className="mt-1 space-y-2 text-gray-700">
              <p>
                Add/remove items from selection with{" "}
                <Kbd>Shift + Click</Kbd>{" "}
                or{" "}
                <Kbd>Ctrl/Cmd + Click</Kbd>.
              </p>
              <p>
                Nudge selected items with{" "}
                <Kbd>Arrow Keys</Kbd>{" "}
                (1px), or{" "}
                <Kbd>Shift + Arrow Keys</Kbd>{" "}
                (10px).
              </p>
              <p>Click empty space on the page to clear selection.</p>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 p-3">
            <div className="font-semibold text-gray-900">Text editing</div>
            <div className="mt-1 space-y-2 text-gray-700">
              <p>Double-click a Text Area to enter rich text editing mode (bold, underline, font size, etc.).</p>
              <p>
                Press{" "}
                <Kbd>Escape</Kbd>{" "}
                to exit text editing mode quickly.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 p-3">
            <div className="font-semibold text-gray-900">Pages and layout</div>
            <div className="mt-1 space-y-2 text-gray-700">
              <p>Use page controls to add, duplicate, rename, move, and delete pages.</p>
              <p>
                In the page name field, press{" "}
                <Kbd>Enter</Kbd>{" "}
                to save rename changes or{" "}
                <Kbd>Escape</Kbd>{" "}
                to cancel.
              </p>
              <p>Use Save Layout / Load Layout to export or restore your JSON layout.</p>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 p-3">
            <div className="font-semibold text-gray-900">Mail merge</div>
            <div className="mt-1 space-y-2 text-gray-700">
              <p>
                Add at least one <strong>Voter Address</strong> or <strong>Voter PIN</strong> component
                before running mail merge.
              </p>
              <p>Choose a voter list source, then run Mail Merge PDF from the sidebar.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
