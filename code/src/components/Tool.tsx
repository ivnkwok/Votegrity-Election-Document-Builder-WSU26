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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      text: toolText,
      type: 'tool',
    } as ToolData,
  });

  const style: React.CSSProperties = isDragging
    ? {
        opacity: 0.35,
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
