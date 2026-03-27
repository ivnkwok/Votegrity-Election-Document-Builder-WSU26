import type * as PdfJsLib from "pdfjs-dist";

export interface PdfPageImage {
  dataUrl: string;
  pageNumber: number;
}

export async function getPdfPageCount(
  pdfjsLib: typeof PdfJsLib,
  file: File
): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

export async function convertPdfFileToImages(
  pdfjsLib: typeof PdfJsLib,
  file: File
): Promise<PdfPageImage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const images: PdfPageImage[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    images.push({ dataUrl, pageNumber: pageNum });
  }

  return images;
}
