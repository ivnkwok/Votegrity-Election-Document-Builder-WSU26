import { useEffect, useRef, useState } from "react";
import type * as PdfJsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export function usePdfWorker() {
  const [workerReady, setWorkerReady] = useState(false);
  const pdfjsLibRef = useRef<typeof PdfJsLib | null>(null);

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

    void initWorker();
  }, []);

  return {
    workerReady,
    pdfjsLibRef,
  };
}
