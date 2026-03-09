import { useState, useRef, useEffect } from "react";
import type * as PdfJsLib from "pdfjs-dist";
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

import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { Upload, FileText, Loader2 } from "lucide-react";

interface PdfUploaderProps {
  onPdfPagesExtracted: (images: { dataUrl: string; pageNumber: number }[]) => void;
}

export function PdfUploader({ onPdfPagesExtracted }: PdfUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [workerReady, setWorkerReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfjsLibRef = useRef<typeof PdfJsLib | null>(null);

  // Initialize PDF.js worker once on component mount
  useEffect(() => {
    const initWorker = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLibRef.current = pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
        setWorkerReady(true);
      } catch (error) {
        console.error("Error initializing PDF.js:", error);
      }
    };

    initWorker();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please select a valid PDF file");
      return;
    }

    setSelectedFile(file);
    
    // Get page count using pdf.js
    if (!pdfjsLibRef.current) {
      alert("PDF library not loaded yet. Please try again.");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLibRef.current.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error loading PDF file. The file may be corrupted or password-protected.");
      setSelectedFile(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile || !pdfjsLibRef.current) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLibRef.current.getDocument({ data: arrayBuffer }).promise;

      const images: { dataUrl: string; pageNumber: number }[] = [];

      // Convert each page to image
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        // Set scale for good quality (2x resolution)
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Create canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas
        await page.render({
          canvas,
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/png");
        images.push({ dataUrl, pageNumber: pageNum });
      }

      // Send images to parent component
      onPdfPagesExtracted(images);

      // Reset and close
      setIsOpen(false);
      setSelectedFile(null);
      setPageCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF file. Please check the console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

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
          {/* File input */}
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
          </div>

          {/* File info */}
          {selectedFile && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pageCount} {pageCount === 1 ? "page" : "pages"} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSelectedFile(null);
                setPageCount(0);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={!selectedFile || isProcessing}
            >
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
