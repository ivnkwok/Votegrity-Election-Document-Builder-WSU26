import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export function Droppable(props: { id: string; children: React.ReactNode }) {
  const {setNodeRef} = useDroppable({
    id: props.id, // Use the id from props
  });
  const style = {
    height: '100%', // Ensure it fills the container
  };
  
  
  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}
