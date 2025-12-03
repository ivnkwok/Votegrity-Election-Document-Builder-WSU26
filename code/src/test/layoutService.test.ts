import { describe, it, expect } from "vitest";
import { loadLayout } from "@/services/layoutService";
import type { CanvasItem } from "@/lib/utils";

function mockFileFromJson(obj: unknown): File {
  return {
    text: async () => JSON.stringify(obj),
  } as unknown as File;
}

describe("layoutService.loadLayout", () => {
  it("loads canonical NEW schema correctly", async () => {
    const layoutJson = {
      version: "1.0.0",
      canvas: { width: 816, height: 1056 },
      components: [
        {
          id: "item-1",
          type: "text",
          content: "Hello",
          position: { x: 10, y: 20 },
          size: { width: 200, height: 40 },
          flags: {
            isMoveable: false,
            isEditable: true,
            minQuantity: 1,
            maxQuantity: 3,
          },
          styles: { fontSize: 16 },
        },
      ],
    };

    const file = mockFileFromJson(layoutJson);
    const items = (await loadLayout(file)) as CanvasItem[];

    expect(items).toHaveLength(1);
    const item = items[0];

    expect(item.id).toBe("item-1");
    expect(item.type).toBe("text");
    expect(item.content).toBe("Hello");
    expect(item.x).toBe(10);
    expect(item.y).toBe(20);
    expect(item.width).toBe(200);
    expect(item.height).toBe(40);
    expect(item.flags).toMatchObject({
      isMoveable: false,
      isEditable: true,
      minQuantity: 1,
      maxQuantity: 3,
    });
    expect(item.styles).toMatchObject({ fontSize: 16 });
  });

  it("throws on invalid schema format", async () => {
    const badJson = { foo: "bar" };
    const file = mockFileFromJson(badJson);

    await expect(loadLayout(file)).rejects.toThrow("Invalid layout format.");
  });
});
