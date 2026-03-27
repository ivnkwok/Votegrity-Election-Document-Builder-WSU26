import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PdfUploaderDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isProcessing: boolean;
  selectedFile: File | null;
  pageCount: number;
  workerReady: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onImport: () => void;
}

export function PdfUploaderDialog({
  isOpen,
  setIsOpen,
  isProcessing,
  selectedFile,
  pageCount,
  workerReady,
  fileInputRef,
  onFileChange,
  onCancel,
  onImport,
}: PdfUploaderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={!workerReady}>
          <Upload className="mr-2 h-4 w-4" />
          Import PDF {!workerReady && "(Loading...)"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import PDF Document</DialogTitle>
          <DialogDescription>
            Upload a PDF file to convert its pages into images that can be placed on the canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
              disabled={isProcessing}
            />
          </div>

          {selectedFile && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-5 w-5 text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {pageCount} {pageCount === 1 ? "page" : "pages"} - {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={onImport} disabled={!selectedFile || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Import Pages"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
