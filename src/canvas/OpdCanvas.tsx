import { useMemo, useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type NodeChange,
  type EdgeChange,
  type NodeDragHandler,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { OpmObjectNode } from './nodes/OpmObjectNode';
import { OpmProcessNode } from './nodes/OpmProcessNode';
import { OpmRelationSymbolNode } from './nodes/OpmRelationSymbolNode';
import { OpmLinkEdge } from './edges/OpmLinkEdge';
import { OpmRelationEdge } from './edges/OpmRelationEdge';
import { SvgDefs } from './edges/SvgDefs';
import { opdToFlow } from './opd-to-flow';
import { ContextMenu, type ContextMenuState } from './ContextMenu';
import { useModelStore } from '../store/model-store';
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

/** Parse "thing-{entityId}-{entityInOpdId}" from a node ID */
function parseNodeId(nodeId: string): { entityId: number; entityInOpdId: number } | null {
  const match = nodeId.match(/^thing-(\d+)-(\d+)$/);
  if (!match) return null;
  return { entityId: Number(match[1]), entityInOpdId: Number(match[2]) };
}

/** Parse entity ID from an edge ID */
function parseEdgeEntityId(edgeId: string): number | null {
  // link-{entityId}-{inOpdId} or grel-{entityId}-{inOpdId}
  const match = edgeId.match(/^(?:link|grel)-(\d+)-/);
  if (!match) return null;
  return Number(match[1]);
}

export function OpdCanvas({ opd, logical }: OpdCanvasProps) {
  const updateNodePosition = useModelStore((s) => s.updateNodePosition);
  const deleteEntity = useModelStore((s) => s.deleteEntity);
  const deleteConnection = useModelStore((s) => s.deleteConnection);
  const setSelectedEntityId = useModelStore((s) => s.setSelectedEntityId);

  // Derive nodes/edges from model (source of truth)
  const { nodes: derivedNodes, edges: derivedEdges } = useMemo(
    () => opdToFlow(opd, logical),
    [opd, logical],
  );

  // Local state for drag interactions (position changes are applied on drag stop)
  const [nodes, setNodes] = useState<Node[]>(derivedNodes);
  const [edges, setEdges] = useState(derivedEdges);

  // Sync when derived data changes (e.g. after CRUD operations)
  const prevDerivedRef = useRef(derivedNodes);
  if (prevDerivedRef.current !== derivedNodes) {
    prevDerivedRef.current = derivedNodes;
    setNodes(derivedNodes);
  }
  const prevEdgesRef = useRef(derivedEdges);
  if (prevEdgesRef.current !== derivedEdges) {
    prevEdgesRef.current = derivedEdges;
    setEdges(derivedEdges);
  }

  // Handle node position changes locally (for smooth dragging)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // Persist position to store on drag stop
  const onNodeDragStop: NodeDragHandler = useCallback(
    (_event, node) => {
      const parsed = parseNodeId(node.id);
      if (parsed) {
        updateNodePosition(opd.id, parsed.entityId, parsed.entityInOpdId, node.position.x, node.position.y);
      }
    },
    [opd.id, updateNodePosition],
  );

  // Handle node deletion
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      for (const node of deleted) {
        const parsed = parseNodeId(node.id);
        if (parsed) deleteEntity(parsed.entityId);
      }
    },
    [deleteEntity],
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deleted: { id: string }[]) => {
      for (const edge of deleted) {
        const entityId = parseEdgeEntityId(edge.id);
        if (entityId !== null) deleteConnection(entityId);
      }
    },
    [deleteConnection],
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const parsed = parseNodeId(node.id);
      if (parsed) setSelectedEntityId(parsed.entityId);
    },
    [setSelectedEntityId],
  );

  const onPaneClick = useCallback(() => {
    setSelectedEntityId(null);
  }, [setSelectedEntityId]);

  // ── Context Menu ──────────────────────────────────────────────────
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        opdId: opd.id,
      });
    },
    [opd.id],
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const parsed = parseNodeId(node.id);
      if (parsed) {
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          opdId: opd.id,
          entityId: parsed.entityId,
          nodeType: node.type as 'opmObject' | 'opmProcess',
        });
      }
    },
    [opd.id],
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: { id: string }) => {
      event.preventDefault();
      const entityId = parseEdgeEntityId(edge.id);
      if (entityId !== null) {
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          opdId: opd.id,
          edgeEntityId: entityId,
        });
      }
    },
    [opd.id],
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <SvgDefs />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onContextMenu={onContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={3}
        deleteKeyCode="Delete"
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
      {contextMenu && (
        <ContextMenu state={contextMenu} onClose={closeContextMenu} />
      )}
    </div>
  );
}
