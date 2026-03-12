import { describe, expect, it } from "vitest";
import { loadDocumentLayout } from "@/services/layoutService";

function mockFileFromJson(obj: unknown): File {
  return {
    text: async () => JSON.stringify(obj),
  } as unknown as File;
}

describe("layoutService.loadDocumentLayout", () => {
  it("loads canonical v2 schema correctly", async () => {
    const docJson = {
      version: "2.0.0",
      canvas: { width: 816, height: 1056, background: "#ffffff", unit: "px" },
      pages: [
        {
          id: "page-1",
          name: "Page 1",
          components: [
            {
              id: "item-1",
              type: "text",
              content: "Hello",
              position: { x: 10, y: 20 },
              size: { width: 200, height: 40 },
              flags: {
                isMovable: false,
                isEditable: true,
                minQuantity: 1,
                maxQuantity: 3,
              },
              styles: { fontSize: 16 },
            },
          ],
        },
      ],
    };

    const file = mockFileFromJson(docJson);
    const doc = await loadDocumentLayout(file);

    expect(doc.pageOrder).toEqual(["page-1"]);
    expect(doc.pageNamesById["page-1"]).toBe("Page 1");

    const pageItems = doc.pagesById["page-1"];
    expect(pageItems).toHaveLength(1);

    const item = pageItems[0];
    expect(item.id).toBe("item-1");
    expect(item.type).toBe("text");
    expect(item.content).toBe("Hello");
    expect(item.x).toBe(10);
    expect(item.y).toBe(20);
    expect(item.width).toBe(200);
    expect(item.height).toBe(40);
    expect(item.flags).toMatchObject({
      isMovable: false,
      isEditable: true,
      minQuantity: 1,
      maxQuantity: 3,
    });
    expect(item.styles).toMatchObject({ fontSize: 16 });
  });

  it("throws on non-v2 schema format", async () => {
    const oldSchema = {
      version: "1.0.0",
      components: [],
    };
    const file = mockFileFromJson(oldSchema);

    await expect(loadDocumentLayout(file)).rejects.toThrow(
      "Invalid layout format. Expected v2 document schema.",
    );
  });
});
