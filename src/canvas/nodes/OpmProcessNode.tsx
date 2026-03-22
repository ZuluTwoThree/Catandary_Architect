import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { Essence } from '../../model/enums';

export type OpmProcessNodeData = {
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
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom-in" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top-out" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left-out" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="right-in" style={{ opacity: 0 }} />

      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          textAlign: 'center',
          wordBreak: 'break-word',
          lineHeight: 1.3,
        }}
      >
        {data.label}
      </div>
    </div>
  );
});

OpmProcessNode.displayName = 'OpmProcessNode';
