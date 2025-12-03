import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarActions } from "@/components/Sidebar/SidebarActions";

describe("SidebarActions", () => {
  it("calls onSave when Save Layout is clicked", () => {
    const onSave = vi.fn();
    const onLoad = vi.fn();
    const onPreview = vi.fn();

    render(
      <SidebarActions onSave={onSave} onLoad={onLoad} onPreview={onPreview} />
    );

    const saveBtn = screen.getByRole("button", { name: /save layout/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("calls onPreview when Open PDF Preview is clicked", () => {
    const onSave = vi.fn();
    const onLoad = vi.fn();
    const onPreview = vi.fn();

    render(
      <SidebarActions onSave={onSave} onLoad={onLoad} onPreview={onPreview} />
    );

    const previewBtn = screen.getByRole("button", { name: /open pdf preview/i });
    fireEvent.click(previewBtn);

    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it("calls onLoad when a file is selected", () => {
    const onSave = vi.fn();
    const onLoad = vi.fn();
    const onPreview = vi.fn();

    render(
      <SidebarActions onSave={onSave} onLoad={onLoad} onPreview={onPreview} />
    );

    // The input is hidden, but still in the DOM
    const fileInput = screen.getByLabelText(/load layout/i) as HTMLInputElement;

    const file = new File([JSON.stringify({ components: [] })], "layout.json", {
      type: "application/json",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onLoad).toHaveBeenCalledTimes(1);
  });
});
