import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CommitNumberInput } from "@/components/Sidebar/properties/CommitNumberInput";

describe("CommitNumberInput", () => {
  it("commits value on Enter", () => {
    const onCommit = vi.fn();

    render(
      <CommitNumberInput
        value={10}
        className="w-20"
        onCommit={onCommit}
      />
    );

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommit).toHaveBeenCalledWith(25);
  });

  it("reverts draft on Escape without committing", () => {
    const onCommit = vi.fn();

    render(
      <CommitNumberInput
        value={10}
        className="w-20"
        onCommit={onCommit}
      />
    );

    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "33" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(input.value).toBe("10");
    expect(onCommit).not.toHaveBeenCalled();
  });
});
