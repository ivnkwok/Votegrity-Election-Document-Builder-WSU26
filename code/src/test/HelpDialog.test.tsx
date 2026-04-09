import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelpDialog } from "@/components/HelpDialog";

describe("HelpDialog", () => {
  it("opens and shows primary usage tips", async () => {
    const user = userEvent.setup();
    render(<HelpDialog />);

    await user.click(screen.getByRole("button", { name: /help/i }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/How to use the Document Builder/i)).toBeInTheDocument();
    expect(screen.getByText(/Double-click a Text Area to enter rich text editing mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Shift \+ Arrow Keys/i)).toBeInTheDocument();
  });
});
