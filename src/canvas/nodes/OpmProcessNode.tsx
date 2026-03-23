import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { type NodeProps, type Node, NodeResizer, useReactFlow } from '@xyflow/react';
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
  const model = useModelStore((s) => s.model);

  const { getNode } = useReactFlow();

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
      const opdId = activeOpdId ?? model?.visual.rootOpd.id;
      if (opdId == null) return;
      updateNodeSize(opdId, Number(match[1]), Number(match[2]), params.width, params.height);
    },
    [id, activeOpdId, model, updateNodeSize],
  );

  // Auto-size: grow node when content overflows
  useEffect(() => {
    if (!contentRef.current || editing) return;
    const el = contentRef.current;
    const scrollH = el.scrollHeight;
    const scrollW = el.scrollWidth;
    const node = getNode(id);
    if (!node) return;
    const currentW = node.measured?.width ?? data.width;
    const currentH = node.measured?.height ?? data.height;

    const neededH = scrollH + 20; // extra padding for ellipse
    const neededW = Math.max(scrollW + 28, MIN_WIDTH);

    if (neededH > currentH || neededW > currentW) {
      const newW = Math.max(currentW, neededW);
      const newH = Math.max(currentH, neededH);
      const match = id.match(/^thing-(\d+)-(\d+)$/);
      if (!match) return;
      const opdId = activeOpdId ?? model?.visual.rootOpd.id;
      if (opdId == null) return;
      updateNodeSize(opdId, Number(match[1]), Number(match[2]), newW, newH);
    }
  }, [data.label, id, activeOpdId, model, data.width, data.height, getNode, updateNodeSize, editing]);

  return (
    <>
      <NodeResizer
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        isVisible={selected}
        lineStyle={{ borderColor: '#0f3460', borderRadius: '50%' }}
        handleStyle={{ backgroundColor: '#0f3460', width: 8, height: 8 }}
        onResizeEnd={onResizeEnd}
        keepAspectRatio={false}
      />
      <div
        ref={contentRef}
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
