import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { RelationType } from '../../model/enums';

export type OpmRelationSymbolNodeData = {
  relationType: RelationType;
  width: number;
  height: number;
  [key: string]: unknown;
};

export type OpmRelationSymbolNodeType = Node<OpmRelationSymbolNodeData, 'opmRelationSymbol'>;

/**
 * OPM Fundamental Relation Symbol Node
 *
 * Renders the shared triangle/diamond symbol that acts as a hub
 * between the source entity and the destination entities.
 *
 * OPM conventions:
 *   Aggregation ▲ (filled black triangle, point up)
 *   Exhibition  ▽ (open triangle, point down)
 *   Generalization △ (open triangle, point up)
 *   Instantiation △ (open triangle, point up, dashed context)
 */
export const OpmRelationSymbolNode = memo(({ data }: NodeProps<OpmRelationSymbolNodeType>) => {
  const w = data.width || 16;
  const h = data.height || 16;

  function getTrianglePath(): { d: string; fill: string; stroke: string } {
    switch (data.relationType) {
      case RelationType.Aggregation:
        // Filled black triangle, point up ▲
        return { d: `M 0 ${h} L ${w / 2} 0 L ${w} ${h} Z`, fill: '#000', stroke: '#000' };
      case RelationType.Exhibition:
        // Open triangle, point down ▽
        return { d: `M 0 0 L ${w / 2} ${h} L ${w} 0 Z`, fill: '#fff', stroke: '#000' };
      case RelationType.Generalization:
        // Open triangle, point up △
        return { d: `M 0 ${h} L ${w / 2} 0 L ${w} ${h} Z`, fill: '#fff', stroke: '#000' };
      case RelationType.Instantiation:
        // Open triangle, point up △ (same shape, dashed edges handled elsewhere)
        return { d: `M 0 ${h} L ${w / 2} 0 L ${w} ${h} Z`, fill: '#fff', stroke: '#000' };
      default:
        return { d: `M 0 ${h} L ${w / 2} 0 L ${w} ${h} Z`, fill: '#fff', stroke: '#000' };
    }
  }

  const tri = getTrianglePath();

  return (
    <div
      style={{
        width: w,
        height: h,
        position: 'relative',
      }}
    >
      {/* Handles on all sides — uses same ID scheme as NodeHandles (center = 50) */}
      <Handle type="target" position={Position.Top} id="top-50" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom-50" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left-50" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="right-50" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top-50-out" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-50-out" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left-50-out" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right-50-out" style={{ opacity: 0 }} />

      <svg width={w} height={h} style={{ display: 'block' }}>
        <path d={tri.d} fill={tri.fill} stroke={tri.stroke} strokeWidth={1.5} />
      </svg>
    </div>
  );
});

OpmRelationSymbolNode.displayName = 'OpmRelationSymbolNode';
