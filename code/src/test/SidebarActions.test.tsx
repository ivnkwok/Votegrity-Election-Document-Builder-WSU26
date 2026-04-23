import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarActions } from "@/components/Sidebar/SidebarActions";

function renderSidebarActions(overrides: Partial<React.ComponentProps<typeof SidebarActions>> = {}) {
  const props: React.ComponentProps<typeof SidebarActions> = {
    onSave: vi.fn(),
    onLoad: vi.fn(),
    onPreview: vi.fn(),
    voterListOptions: [
      { value: "selected-election", label: "Selected Election Users" },
      { value: "upload", label: "Upload JSON File" },
    ],
    selectedVoterList: "selected-election",
    uploadedVoterListName: null,
    canRunMailMerge: true,
    isMailMerging: false,
    onSelectedVoterListChange: vi.fn(),
    onUploadVoterList: vi.fn(),
    onRunMailMerge: vi.fn(),
    ...overrides,
  };

  render(<SidebarActions {...props} />);
  return props;
}

describe("SidebarActions", () => {
  it("calls onSave when Save Layout is clicked", () => {
    const props = renderSidebarActions();

    const saveBtn = screen.getByRole("button", { name: /save layout/i });
    fireEvent.click(saveBtn);

    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  it("calls onPreview when Open PDF Preview is clicked", () => {
    const props = renderSidebarActions();

    const previewBtn = screen.getByRole("button", { name: /open pdf preview/i });
    fireEvent.click(previewBtn);

    expect(props.onPreview).toHaveBeenCalledTimes(1);
  });

  it("calls onLoad when a file is selected", () => {
    const props = renderSidebarActions();

    const fileInput = screen.getByLabelText(/load layout/i) as HTMLInputElement;
    const file = new File([JSON.stringify({ components: [] })], "layout.json", {
      type: "application/json",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(props.onLoad).toHaveBeenCalledTimes(1);
  });

  it("changes voter list source from the select control", async () => {
    const user = userEvent.setup();
    const props = renderSidebarActions();
    const select = screen.getByRole("combobox", { name: /voter list source/i });

    await user.click(select);
    await user.click(await screen.findByText(/upload json file/i));

    expect(props.onSelectedVoterListChange).toHaveBeenCalledWith("upload");
  });

  it("calls upload handler when selecting a voter json file", () => {
    const props = renderSidebarActions({
      selectedVoterList: "upload",
    });

    const fileInput = screen.getByLabelText(/upload voter json/i) as HTMLInputElement;
    const file = new File([JSON.stringify({ voters: [] })], "voters.json", {
      type: "application/json",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(props.onUploadVoterList).toHaveBeenCalledTimes(1);
  });

  it("calls onRunMailMerge when Run Mail Merge PDF is clicked", () => {
    const props = renderSidebarActions();
    const mergeButton = screen.getByRole("button", { name: /run mail merge pdf/i });

    fireEvent.click(mergeButton);

    expect(props.onRunMailMerge).toHaveBeenCalledTimes(1);
  });

  it("disables Run Mail Merge PDF while merge is processing", () => {
    renderSidebarActions({
      isMailMerging: true,
    });

    const mergeButton = screen.getByRole("button", { name: /generating mail merge/i });
    expect(mergeButton).toBeDisabled();
  });
});
