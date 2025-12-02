import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableProps {
  id: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Draggable({ id, children, style, className }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: 100,
    } : undefined),
  };

  return (
    <div ref={setNodeRef} style={combinedStyle} {...listeners} {...attributes} className={className}>
      {children}
    </div>
  );
}