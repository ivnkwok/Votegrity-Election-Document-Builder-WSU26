import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import type { DragSession } from "@/hooks/canvasDnd/dragGroup";

const mockHandleMailMergePDF = vi.fn(async () => undefined);

const emptyDragSession: DragSession = {
  activeId: null,
  rawDelta: { x: 0, y: 0 },
  appliedDelta: { x: 0, y: 0 },
  moveIds: new Set<string>(),
};

vi.mock("@/hooks/useAppController", () => {
  return {
    useAppController: () => ({
      canvasItems: [],
      selectedId: null,
      selectedIds: new Set<string>(),
      dragSession: emptyDragSession,
      editingItemId: null,
      selectOne: vi.fn(),
      toggleSelect: vi.fn(),
      clearSelection: vi.fn(),
      setEditingItemId: vi.fn(),
      handleLoadFile: vi.fn(),
      handlePreviewPDF: vi.fn(async () => undefined),
      handleMailMergePDF: mockHandleMailMergePDF,
      handleDragStart: vi.fn(),
      handleDragMove: vi.fn(),
      handleDragCancel: vi.fn(),
      handleDragEnd: vi.fn(),
      handlePdfImport: vi.fn(),
      save: vi.fn(),
      updateItem: vi.fn(),
      pageOrder: ["page-1"],
      activePageId: "page-1",
      pageNamesById: { "page-1": "Page 1" },
      switchPage: vi.fn(),
      addPage: vi.fn(),
      duplicatePage: vi.fn(),
      deletePage: vi.fn(),
      renamePage: vi.fn(),
      movePage: vi.fn(),
      loadDocument: vi.fn(),
      isMailMerging: false,
      toolStatusMessage: null,
    }),
  };
});

vi.mock("@/components/Canvas/Canvas", () => {
  return {
    Canvas: () => <div data-testid="canvas" />,
  };
});

vi.mock("@/components/PdfUploader", () => {
  return {
    PdfUploader: () => <div data-testid="pdf-uploader" />,
  };
});

async function openVoterListSourceSelect(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  const select = screen.getByRole("combobox", { name: /voter list source/i });
  await user.click(select);
}

describe("App mail merge uploads", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    mockHandleMailMergePDF.mockClear();
  });

  it("shows the uploaded voter filename only while upload mode is active", async () => {
    const user = userEvent.setup();
    render(<App />);

    await openVoterListSourceSelect(user);
    await user.click(await screen.findByText(/upload json file/i));

    const uploadInput = screen.getByLabelText(/upload voter json/i) as HTMLInputElement;
    const voterFile = new File([JSON.stringify({ voters: [] })], "valid-voters.json", {
      type: "application/json",
    });
    Object.defineProperty(voterFile, "text", {
      configurable: true,
      value: vi.fn(async () => JSON.stringify({ voters: [] })),
    });

    fireEvent.change(uploadInput, { target: { files: [voterFile] } });

    expect(await screen.findByText(/loaded: valid-voters\.json/i)).toBeInTheDocument();
    expect(uploadInput.value).toBe("");

    await openVoterListSourceSelect(user);
    await user.click(await screen.findByText(/sample voters \(canonical\)/i));

    expect(screen.queryByText(/loaded: valid-voters\.json/i)).not.toBeInTheDocument();
  });

  it("clears stale upload state after an invalid voter file is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    await openVoterListSourceSelect(user);
    await user.click(await screen.findByText(/upload json file/i));

    const uploadInput = screen.getByLabelText(/upload voter json/i) as HTMLInputElement;
    const validFile = new File([JSON.stringify({ voters: [] })], "valid-voters.json", {
      type: "application/json",
    });
    const invalidFile = new File(["{invalid"], "broken-voters.json", {
      type: "application/json",
    });
    Object.defineProperty(validFile, "text", {
      configurable: true,
      value: vi.fn(async () => JSON.stringify({ voters: [] })),
    });
    Object.defineProperty(invalidFile, "text", {
      configurable: true,
      value: vi.fn(async () => "{invalid"),
    });

    fireEvent.change(uploadInput, { target: { files: [validFile] } });
    expect(await screen.findByText(/loaded: valid-voters\.json/i)).toBeInTheDocument();

    fireEvent.change(uploadInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /run mail merge pdf/i })).toBeDisabled();
    });
    expect(window.alert).toHaveBeenCalledWith("Could not parse voter list JSON file.");
    expect(screen.queryByText(/loaded:/i)).not.toBeInTheDocument();
  });
});
