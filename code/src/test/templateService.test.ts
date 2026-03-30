import { describe, expect, it } from "vitest";
import { TEMPLATE_OPTIONS, loadTemplateLayout, type TemplateId } from "@/services/templateService";

describe("templateService.loadTemplateLayout", () => {
  it("loads every configured template with valid page structure", () => {
    for (const option of TEMPLATE_OPTIONS) {
      const doc = loadTemplateLayout(option.value as TemplateId);

      expect(doc.pageOrder.length).toBeGreaterThanOrEqual(1);
      expect(doc.pageOrder.length).toBe(Object.keys(doc.pagesById).length);
      expect(doc.pageOrder[0]).toBe("page-1");

      if (option.value !== "blank-template") {
        expect(doc.pageOrder.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("loads blank template as an empty single-page document", () => {
    const doc = loadTemplateLayout("blank-template");
    expect(doc.pageOrder).toEqual(["page-1"]);
    expect(doc.pageNamesById["page-1"]).toBe("Page 1");
    expect(doc.pagesById["page-1"]).toEqual([]);
  });

  it("contains ballot proof-of-concept content", () => {
    const doc = loadTemplateLayout("ballot-template");
    expect(doc.pageNamesById["page-1"]).toBe("Cover");
    expect(doc.pageNamesById["page-2"]).toBe("Contests");
    expect(doc.pageNamesById["page-3"]).toBe("Return Instructions");
  });

  it("uses base-relative Votegrity logo paths in templates", () => {
    for (const templateId of [
      "ballot-template",
      "notice-template",
      "candidate-statement-template",
    ] as const) {
      const doc = loadTemplateLayout(templateId);
      const items = doc.pageOrder.flatMap((pageId) => doc.pagesById[pageId] ?? []);
      const logos = items.filter((item) => item.type === "image" && item.sourceToolId === "votegrity-logo");

      expect(logos.length).toBeGreaterThan(0);
      logos.forEach((logo) => {
        expect(logo.content).toBe("votegrity-logo.png");
      });
    }
  });
});
