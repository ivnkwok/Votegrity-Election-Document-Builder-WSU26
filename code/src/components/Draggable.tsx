import React, { useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

export function Draggable({
  id,
  children,
  style,
  className,
  disabled = false,
  onPointerDown,
  ...props
}: DraggableProps) {
  const modifiersRef = useRef({ shift: false, meta: false });

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled,
    data: { getModifiers: () => modifiersRef.current },
  });

  const dragPointerDown = listeners?.onPointerDown;
  const otherListeners = listeners
    ? Object.fromEntries(Object.entries(listeners).filter(([name]) => name !== "onPointerDown"))
    : {};

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(transform ? {
      transform:
        typeof style?.transform === "string"
          ? style.transform
          : `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: 100,
    } : undefined),
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...otherListeners}
      onPointerDown={(e) => {
        modifiersRef.current = { shift: e.shiftKey, meta: e.metaKey || e.ctrlKey };
        dragPointerDown?.(e);
        onPointerDown?.(e);
      }}
      {...attributes}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
