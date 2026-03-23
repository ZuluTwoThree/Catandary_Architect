import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { type NodeProps, type Node, NodeResizer } from '@xyflow/react';
import type { OpdVisualState } from '../../model/types';
import type { Essence } from '../../model/enums';
import { NodeHandles } from './NodeHandles';
import { useModelStore } from '../../store/model-store';

export type OpmObjectNodeData = {
  entityId: number;
  label: string;
  essence: Essence;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  states: Array<{
    id: string;
    label: string;
    visual: OpdVisualState;
  }>;
  width: number;
  height: number;
  [key: string]: unknown;
};

export type OpmObjectNodeType = Node<OpmObjectNodeData, 'opmObject'>;

const MIN_WIDTH = 60;
const MIN_HEIGHT = 40;

export const OpmObjectNode = memo(({ id, data, selected }: NodeProps<OpmObjectNodeType>) => {
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
        className="opm-object"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: data.backgroundColor,
          borderColor: data.borderColor,
          color: data.textColor,
          borderWidth: isPhysical ? 3 : 1.5,
          borderStyle: 'solid',
          borderRadius: 0,
          boxShadow: isPhysical ? `3px 3px 0 ${data.borderColor}` : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: data.states.length > 0 ? 'flex-start' : 'center',
          padding: '4px 6px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
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
              width: '90%',
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
              padding: data.states.length > 0 ? '2px 0 4px' : '0',
              cursor: 'text',
            }}
          >
            {data.label}
          </div>
        )}

        {data.states.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: 'center',
              padding: '2px 4px',
            }}
          >
            {data.states.map((state) => (
              <div
                key={state.id}
                className="opm-state"
                style={{
                  backgroundColor: state.visual.backgroundColor,
                  borderColor: state.visual.borderColor,
                  color: state.visual.textColor,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderRadius: 12,
                  padding: '2px 8px',
                  fontSize: 10,
                  textAlign: 'center',
                  minWidth: 30,
                }}
              >
                {state.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
});

OpmObjectNode.displayName = 'OpmObjectNode';
