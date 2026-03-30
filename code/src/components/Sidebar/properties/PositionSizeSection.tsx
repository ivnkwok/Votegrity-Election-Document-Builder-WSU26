import { CommitNumberInput } from "./CommitNumberInput";
import type { PropertiesSectionProps } from "./types";

interface PositionSizeSectionProps extends PropertiesSectionProps {
  isMoveable: boolean;
}

export function PositionSizeSection({ item, onChange, isMoveable }: PositionSizeSectionProps) {
  return (
    <>
      <div>
        <strong>Position</strong>
        <div className="mt-1 flex gap-2">
          <label className="flex items-center gap-1">
            X
            <CommitNumberInput
              className="h-7 w-20 px-1 py-0.5 text-sm"
              value={item.x}
              disabled={!isMoveable}
              onCommit={(value) => onChange(item.id, { x: value })}
            />
          </label>

          <label className="flex items-center gap-1">
            Y
            <CommitNumberInput
              className="h-7 w-20 px-1 py-0.5 text-sm"
              value={item.y}
              disabled={!isMoveable}
              onCommit={(value) => onChange(item.id, { y: value })}
            />
          </label>
        </div>
      </div>

      <div>
        <strong>Size</strong>
        <div className="mt-1 flex gap-2">
          <label className="flex items-center gap-1">
            W
            <CommitNumberInput
              className="h-7 w-20 px-1 py-0.5 text-sm"
              value={item.width ?? 200}
              onCommit={(value) => onChange(item.id, { width: value })}
            />
          </label>

          <label className="flex items-center gap-1">
            H
            <CommitNumberInput
              className="h-7 w-20 px-1 py-0.5 text-sm"
              value={item.height ?? 40}
              onCommit={(value) => onChange(item.id, { height: value })}
            />
          </label>
        </div>
      </div>
    </>
  );
}
