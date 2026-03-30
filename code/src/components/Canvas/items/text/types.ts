import type { CanvasItem } from "@/lib/utils";

export interface CanvasTextItemProps {
  item: CanvasItem;
  isEditing: boolean;
  onChangeItem: (id: string, updates: Partial<CanvasItem>) => void;
  onExitEditMode: () => void;
}

export const MIXED_VALUE = "__mixed__";

export type ResolvedSelectionValue = string | null | typeof MIXED_VALUE;

export interface SelectionStyleState {
  fontFamily: ResolvedSelectionValue;
  fontSize: ResolvedSelectionValue;
  color: ResolvedSelectionValue;
}

export interface DefaultTextStyles {
  fontFamily: string;
  fontSize: string;
  color: string;
}
