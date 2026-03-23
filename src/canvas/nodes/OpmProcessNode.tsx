import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import type { Essence } from '../../model/enums';
import { NodeHandles } from './NodeHandles';
import { useModelStore } from '../../store/model-store';

export type OpmProcessNodeData = {
  entityId: number;
  label: string;
  essence: Essence;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  width: number;
  height: number;
  [key: string]: unknown;
};

export type OpmProcessNodeType = Node<OpmProcessNodeData, 'opmProcess'>;

export const OpmProcessNode = memo(({ data }: NodeProps<OpmProcessNodeType>) => {
  const isPhysical = data.essence === 'physical';
  const renameEntity = useModelStore((s) => s.renameEntity);

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(data.label);
    setEditing(true);
  }, [data.label]);

  const commitRename = useCallback(() => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== data.label) {
      renameEntity(data.entityId, trimmed);
    }
  }, [editValue, data.label, data.entityId, renameEntity]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitRename();
      if (e.key === 'Escape') setEditing(false);
    },
    [commitRename],
  );

  return (
    <div
      className="opm-process"
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: data.backgroundColor,
        borderColor: data.borderColor,
        color: data.textColor,
        borderWidth: isPhysical ? 3 : 1.5,
        borderStyle: 'solid',
        borderRadius: '50%',
        boxShadow: isPhysical ? `3px 3px 0 ${data.borderColor}` : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <NodeHandles />

      {editing ? (
        <input
          ref={inputRef}
          className="inline-edit-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={onKeyDown}
          style={{
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
            border: '1px solid #0f3460',
            borderRadius: 2,
            padding: '1px 4px',
            width: '80%',
            background: '#fff',
            outline: 'none',
          }}
        />
      ) : (
        <div
          onDoubleClick={onDoubleClick}
          style={{
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
            wordBreak: 'break-word',
            lineHeight: 1.3,
            cursor: 'text',
          }}
        >
          {data.label}
        </div>
      )}
    </div>
  );
});

OpmProcessNode.displayName = 'OpmProcessNode';
