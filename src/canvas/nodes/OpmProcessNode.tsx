import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { type NodeProps, type Node, NodeResizer } from '@xyflow/react';
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

const MIN_WIDTH = 60;
const MIN_HEIGHT = 40;

export const OpmProcessNode = memo(({ id, data, selected }: NodeProps<OpmProcessNodeType>) => {
  const isPhysical = data.essence === 'physical';
  const renameEntity = useModelStore((s) => s.renameEntity);
  const updateNodeSize = useModelStore((s) => s.updateNodeSize);
  const activeOpdId = useModelStore((s) => s.activeOpdId);
  const rootOpdId = useModelStore((s) => s.model?.visual.rootOpd.id);

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

  // Persist size on resize end
  const onResizeEnd = useCallback(
    (_event: unknown, params: { width: number; height: number }) => {
      const match = id.match(/^thing-(\d+)-(\d+)$/);
      if (!match) return;
      const opdId = activeOpdId ?? rootOpdId;
      if (opdId == null) return;
      updateNodeSize(opdId, Number(match[1]), Number(match[2]), params.width, params.height);
    },
    [id, activeOpdId, rootOpdId, updateNodeSize],
  );

  return (
    <>
      <NodeResizer
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        isVisible={selected}
        lineStyle={{ borderColor: '#0f3460' }}
        handleStyle={{ backgroundColor: '#0f3460', width: 8, height: 8 }}
        onResizeEnd={onResizeEnd}
      />
      <div
        className="opm-process"
        style={{
          width: '100%',
          height: '100%',
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
    </>
  );
});

OpmProcessNode.displayName = 'OpmProcessNode';
