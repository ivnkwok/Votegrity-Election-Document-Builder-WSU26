import type { CSSProperties } from "react";
import type { CanvasItem } from "@/lib/utils";
import { LETTER_PAGE_CANVAS_BOUNDS } from "@/lib/canvasBounds";

interface ExportCanvasPagesArgs {
  pages: CanvasItem[][];
  filename?: string;
}

const UNITLESS_PROPERTIES = new Set([
  "fontWeight",
  "lineHeight",
  "opacity",
  "zIndex",
  "flexGrow",
  "flexShrink",
  "order",
]);

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function formatCssValue(property: string, value: string | number): string {
  if (typeof value === "number" && !UNITLESS_PROPERTIES.has(property)) {
    return `${value}px`;
  }

  return String(value);
}

function applyStyleObject(element: HTMLElement, styles?: CSSProperties): void {
  if (!styles) return;

  for (const [property, rawValue] of Object.entries(styles)) {
    if (rawValue === undefined || rawValue === null) continue;
    element.style.setProperty(
      toKebabCase(property),
      formatCssValue(property, rawValue as string | number)
    );
  }
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(images.map((image) => {
    if (image.complete) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const finish = () => resolve();
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
    });
  }));
}

function createBoxItemElement(item: CanvasItem): HTMLElement {
  const element = document.createElement("div");
  element.style.width = "100%";
  element.style.height = "100%";
  element.style.boxSizing = "border-box";
  applyStyleObject(element, item.styles);
  return element;
}

function createImageItemElement(item: CanvasItem): HTMLElement {
  const image = document.createElement("img");
  image.src = item.content ?? "";
  image.alt = "";
  image.style.width = "100%";
  image.style.height = "100%";
  image.style.objectFit = "contain";
  return image;
}

function createTextItemElement(item: CanvasItem, sanitizeHtml: (value: string) => string): HTMLElement {
  const element = document.createElement("div");
  element.style.width = "100%";
  element.style.height = "100%";
  applyStyleObject(element, item.styles);

  if (item.sourceToolId === "text-area") {
    element.innerHTML = sanitizeHtml(item.content ?? "<p></p>");
    return element;
  }

  element.style.whiteSpace = "pre-wrap";
  element.textContent = item.content ?? "";
  return element;
}

function createCanvasItemElement(
  item: CanvasItem,
  sanitizeHtml: (value: string) => string
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.boxSizing = "border-box";
  wrapper.style.position = "absolute";
  wrapper.style.left = `${item.x}px`;
  wrapper.style.top = `${item.y}px`;
  wrapper.style.width = `${item.width ?? 200}px`;
  wrapper.style.height = `${item.height ?? 40}px`;
  wrapper.style.padding = "4px";
  wrapper.style.backgroundColor = "white";

  switch (item.type) {
    case "box":
      wrapper.appendChild(createBoxItemElement(item));
      break;
    case "image":
      wrapper.appendChild(createImageItemElement(item));
      break;
    case "text":
    default:
      wrapper.appendChild(createTextItemElement(item, sanitizeHtml));
      break;
  }

  return wrapper;
}

function createPageElement(
  items: CanvasItem[],
  sanitizeHtml: (value: string) => string
): HTMLDivElement {
  const page = document.createElement("div");
  page.style.width = `${LETTER_PAGE_CANVAS_BOUNDS.width}px`;
  page.style.height = `${LETTER_PAGE_CANVAS_BOUNDS.height}px`;
  page.style.position = "relative";
  page.style.overflow = "hidden";
  page.style.backgroundColor = "#ffffff";
  page.style.color = "#111827";
  page.style.boxSizing = "border-box";

  items.forEach((item) => {
    page.appendChild(createCanvasItemElement(item, sanitizeHtml));
  });

  return page;
}

async function capturePageItemsAsPngDataUrl(items: CanvasItem[]): Promise<string> {
  const [{ default: html2canvas }, { default: DOMPurify }] = await Promise.all([
    import("html2canvas-pro"),
    import("dompurify"),
  ]);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = `${LETTER_PAGE_CANVAS_BOUNDS.width}px`;
  container.style.pointerEvents = "none";
  container.style.opacity = "0";
  container.style.zIndex = "-1";

  const page = createPageElement(items, (value) => DOMPurify.sanitize(value));
  container.appendChild(page);
  document.body.appendChild(container);

  const previousColorScheme = document.documentElement.style.colorScheme;
  document.documentElement.style.colorScheme = "light";

  try {
    await waitForNextFrame();
    await waitForImages(container);

    const canvas = await html2canvas(page, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    return canvas.toDataURL("image/png");
  } finally {
    document.documentElement.style.colorScheme = previousColorScheme;
    container.remove();
  }
}

async function openPngPagesAsPdf(pngDataUrls: string[], filename: string): Promise<void> {
  if (pngDataUrls.length === 0) return;

  const { default: jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    unit: "in",
    format: "letter",
    orientation: "portrait",
  });

  pngDataUrls.forEach((img, index) => {
    if (index > 0) {
      pdf.addPage();
    }

    pdf.addImage(img, "PNG", 0, 0, 8.5, 11);
  });

  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const newTab = window.open("", "_blank");

  if (newTab) {
    newTab.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  pdf.save(filename);
}

export async function exportCanvasPagesToPdf({
  pages,
  filename = "preview.pdf",
}: ExportCanvasPagesArgs): Promise<void> {
  if (pages.length === 0) return;

  const pngPages: string[] = [];
  for (const items of pages) {
    pngPages.push(await capturePageItemsAsPngDataUrl(items));
  }

  await openPngPagesAsPdf(pngPages, filename);
}
