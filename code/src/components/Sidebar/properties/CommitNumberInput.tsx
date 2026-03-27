import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface CommitNumberInputProps {
  value: number;
  disabled?: boolean;
  className: string;
  onCommit: (value: number) => void;
}

export function CommitNumberInput({ value, disabled, className, onCommit }: CommitNumberInputProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const normalized = draft.trim();
    if (
      normalized === "" ||
      normalized === "-" ||
      normalized === "." ||
      normalized === "-."
    ) {
      setDraft(String(value));
      return;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }

    onCommit(parsed);
    setDraft(String(parsed));
  };

  return (
    <Input
      type="number"
      className={className}
      disabled={disabled}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          setDraft(String(value));
          e.currentTarget.blur();
        }
      }}
    />
  );
}
