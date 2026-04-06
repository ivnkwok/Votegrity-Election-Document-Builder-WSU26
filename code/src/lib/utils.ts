import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export interface CanvasItem {
  id: string;
  type: 'text' | 'box' | 'image';
  sourceToolId: string;
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  flags?: {
    isMovable: boolean;
    isEditable: boolean;
    minQuantity: number;
    maxQuantity: number;
  };
  styles?: React.CSSProperties;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
