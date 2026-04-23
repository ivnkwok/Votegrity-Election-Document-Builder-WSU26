import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import type { DragSession } from "@/hooks/canvasDnd/dragGroup";
import * as apiService from "@/services/apiService";

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
      handleMailMergePDF: vi.fn(async () => undefined),
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
      deleteSelectedItems: vi.fn(),
      isMailMerging: false,
      toolStatusMessage: null,
    }),
  };
});

vi.mock("@/services/apiService", async () => {
  const actual = await vi.importActual<typeof import("@/services/apiService")>("@/services/apiService");
  return {
    ...actual,
    fetchAdministeredElectionRecords: vi.fn(async () => []),
    fetchElectionUsers: vi.fn(async () => ({ voters: [] })),
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

describe("App election selector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a live-load error instead of falling back to bundled elections", async () => {
    vi.mocked(apiService.fetchAdministeredElectionRecords).mockRejectedValueOnce(
      new apiService.ElectionApiError({
        code: "auth-redirect",
        message: "Election service redirected to a login page.",
        url: "https://docscreator.votegrity.net/auth/",
        status: 200,
        contentType: "text/html",
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(apiService.fetchAdministeredElectionRecords).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText(/authenticated server session/i)
    ).toBeInTheDocument();

    const electionSelector = screen.getByRole("combobox", { name: /election data/i });
    expect(electionSelector).toHaveValue("");
    expect(electionSelector).toHaveAttribute("placeholder", "No election selected");
    expect(apiService.fetchElectionUsers).not.toHaveBeenCalled();
  });

  it("loads live elections and still allows the selection to be cleared", async () => {
    vi.mocked(apiService.fetchAdministeredElectionRecords).mockResolvedValueOnce([
      {
        uuid: "9f7ffa9c-b294-4bb5-9c31-2bc1341cc61a",
        name: "Roland Springs",
        short_name: "RolandSprings2026v2",
        questions: [
          {
            id: 1,
            question: "Board of Directors",
            answers: ["Jim Campbell"],
          },
        ],
      },
    ]);

    const user = userEvent.setup();
    render(<App />);

    const electionSelector = screen.getByRole("combobox", { name: /election data/i });
    await waitFor(() => {
      expect(electionSelector).not.toBeDisabled();
    });

    await user.click(electionSelector);
    await user.click(await screen.findByText("RolandSprings2026v2"));

    await waitFor(() => {
      expect(electionSelector).toHaveValue("RolandSprings2026v2");
    });
    expect(apiService.fetchElectionUsers).toHaveBeenCalledWith(
      "9f7ffa9c-b294-4bb5-9c31-2bc1341cc61a"
    );

    await user.clear(electionSelector);

    await waitFor(() => {
      expect(electionSelector).toHaveValue("");
    });
    expect(electionSelector).toHaveAttribute("placeholder", "No election selected");
    expect(apiService.fetchElectionUsers).toHaveBeenCalledTimes(1);
  });
});
