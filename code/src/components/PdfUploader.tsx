import { useRef, useState } from "react";
import { PdfUploaderDialog } from "@/components/pdfUploader/PdfUploaderDialog";
import { convertPdfFileToImages, getPdfPageCount } from "@/components/pdfUploader/pdfProcessing";
import { usePdfWorker } from "@/components/pdfUploader/usePdfWorker";

interface PdfUploaderProps {
  onPdfPagesExtracted: (images: { dataUrl: string; pageNumber: number }[]) => void;
}

export function PdfUploader({ onPdfPagesExtracted }: PdfUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { workerReady, pdfjsLibRef } = usePdfWorker();

  const resetDialogState = () => {
    setSelectedFile(null);
    setPageCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please select a valid PDF file");
      return;
    }

    setSelectedFile(file);

    if (!pdfjsLibRef.current) {
      alert("PDF library not loaded yet. Please try again.");
      return;
    }

    try {
      const pages = await getPdfPageCount(pdfjsLibRef.current, file);
      setPageCount(pages);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error loading PDF file. The file may be corrupted or password-protected.");
      setSelectedFile(null);
      setPageCount(0);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile || !pdfjsLibRef.current) return;

    setIsProcessing(true);

    try {
      const images = await convertPdfFileToImages(pdfjsLibRef.current, selectedFile);
      onPdfPagesExtracted(images);
      setIsOpen(false);
      resetDialogState();
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF file. Please check the console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PdfUploaderDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      isProcessing={isProcessing}
      selectedFile={selectedFile}
      pageCount={pageCount}
      workerReady={workerReady}
      fileInputRef={fileInputRef}
      onFileChange={handleFileSelect}
      onCancel={() => {
        setIsOpen(false);
        resetDialogState();
      }}
      onImport={() => {
        void handleProcess();
      }}
    />
  );
}
