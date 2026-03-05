import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
    Item,
    ItemContent,
  } from "@/components/ui/item"

// Define the shape of our custom data
export interface ToolData {
  text: string;
  type: 'tool';
}

// Define the props for this component
interface DraggableToolProps {
  id: string;
  toolText: string;
}

export function DraggableTool({ id, toolText }: DraggableToolProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: {
      text: toolText,
      type: 'tool',
    } as ToolData,
  });

  // Apply a transform style if the item is being dragged
  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999, // Ensure it's on top while dragging
      }
    : {};

  return (
    <Item ref={setNodeRef} style={style} {...listeners} {...attributes} variant='outline' className='w-full max-w-full bg-white text-center border border-gray-300 rounded-md'>
        <ItemContent>
         {toolText}
        </ItemContent>
    </Item>
  );
}
