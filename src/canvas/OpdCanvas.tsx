import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { OpmObjectNode } from './nodes/OpmObjectNode';
import { OpmProcessNode } from './nodes/OpmProcessNode';
import { OpmRelationSymbolNode } from './nodes/OpmRelationSymbolNode';
import { OpmLinkEdge } from './edges/OpmLinkEdge';
import { OpmRelationEdge } from './edges/OpmRelationEdge';
import { SvgDefs } from './edges/SvgDefs';
import { opdToFlow } from './opd-to-flow';
import type { OpdDiagram, LogicalModel } from '../model/types';

const nodeTypes: NodeTypes = {
  opmObject: OpmObjectNode,
  opmProcess: OpmProcessNode,
  opmRelationSymbol: OpmRelationSymbolNode,
};

const edgeTypes: EdgeTypes = {
  opmLink: OpmLinkEdge,
  opmRelation: OpmRelationEdge,
};

interface OpdCanvasProps {
  opd: OpdDiagram;
  logical: LogicalModel;
}

export function OpdCanvas({ opd, logical }: OpdCanvasProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => opdToFlow(opd, logical),
    [opd, logical],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const defaultViewport = useMemo(() => {
    if (nodes.length === 0) return { x: 0, y: 0, zoom: 1 };
    // Compute bounding box to center the view
    let minX = Infinity, minY = Infinity;
    for (const n of initialNodes) {
      if (n.position.x < minX) minX = n.position.x;
      if (n.position.y < minY) minY = n.position.y;
    }
    return { x: -minX + 40, y: -minY + 40, zoom: 0.85 };
  }, [initialNodes, nodes.length]);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <SvgDefs />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={defaultViewport}
        proOptions={proOptions}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={3}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e0e0e0" />
        <Controls />
        <MiniMap
          nodeStrokeWidth={2}
          nodeColor={(node) => {
            if (node.type === 'opmProcess') return '#e8f5e9';
            return '#e3f2fd';
          }}
          style={{ border: '1px solid #ccc' }}
        />
      </ReactFlow>
    </div>
  );
}
