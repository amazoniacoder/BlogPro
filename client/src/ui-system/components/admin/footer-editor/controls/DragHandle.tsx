import React from 'react';
import { Icon } from '../../../../icons/components';

interface DragHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export const DragHandle: React.FC<DragHandleProps> = ({ onMouseDown }) => {
  return (
    <div
      className="drag-handle"
      onMouseDown={onMouseDown}
      title="Перетащить блок"
    >
      <Icon name="move" size={16} />
    </div>
  );
};