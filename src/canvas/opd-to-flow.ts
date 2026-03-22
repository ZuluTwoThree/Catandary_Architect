/**
 * Transforms an OPD diagram (from the parsed OPM model) into
 * React Flow nodes and edges for rendering on the canvas.
 */
import type { Node, Edge } from '@xyflow/react';
import type {
  OpdDiagram,
  OpdVisualThing,
  OpdVisualLink,
  OpdFundamentalRelationGroup,
  OpdVisualGeneralRelation,
  LogicalModel,
} from '../model/types';
import { ConnectionSide, Essence } from '../model/enums';
import type { OpmObjectNodeData } from './nodes/OpmObjectNode';
import type { OpmProcessNodeData } from './nodes/OpmProcessNode';

// ─── Helpers ──────────────────────────────────────────────────────────

function connectionSideToHandle(side: ConnectionSide, isSource: boolean): string {
  switch (side) {
    case ConnectionSide.Top:
      return isSource ? 'top-out' : 'top';
    case ConnectionSide.Bottom:
      return isSource ? 'bottom' : 'bottom-in';
    case ConnectionSide.Left:
      return isSource ? 'left-out' : 'left';
    case ConnectionSide.Right:
      return isSource ? 'right' : 'right-in';
    default:
      return isSource ? 'bottom' : 'top';
  }
}

/** Build a lookup from entityId → node ID in this OPD */
function buildEntityNodeMap(things: OpdVisualThing[]): Map<number, string> {
  const map = new Map<number, string>();
  function walk(thing: OpdVisualThing) {
    map.set(thing.entityId, `thing-${thing.entityId}-${thing.entityInOpdId}`);
    for (const state of thing.visualStates) {
      map.set(state.entityId, `thing-${thing.entityId}-${thing.entityInOpdId}`);
    }
    for (const child of thing.children) {
      walk(child);
    }
  }
  for (const t of things) walk(t);
  return map;
}

// ─── Thing Nodes ──────────────────────────────────────────────────────

function thingToNode(
  thing: OpdVisualThing,
  logical: LogicalModel,
): Node {
  const nodeId = `thing-${thing.entityId}-${thing.entityInOpdId}`;

  if (thing.thingType === 'object') {
    const obj = logical.objects.get(thing.entityId);
    const states = thing.visualStates
      .filter((vs) => vs.visible)
      .map((vs) => {
        const logicalState = obj?.states.find((s) => s.entity.id === vs.entityId);
        return {
          id: `state-${vs.entityId}-${vs.entityInOpdId}`,
          label: logicalState?.entity.name ?? `S${vs.entityId}`,
          visual: vs,
        };
      });

    const data: OpmObjectNodeData = {
      label: obj?.entity.name ?? `Object ${thing.entityId}`,
      essence: obj?.essence ?? Essence.Informatical,
      backgroundColor: thing.backgroundColor,
      borderColor: thing.borderColor,
      textColor: thing.textColor,
      states,
      width: thing.width,
      height: thing.height,
    };

    return {
      id: nodeId,
      type: 'opmObject',
      position: { x: thing.x, y: thing.y },
      data,
    };
  }

  // Process
  const proc = logical.processes.get(thing.entityId);
  const data: OpmProcessNodeData = {
    label: proc?.entity.name ?? `Process ${thing.entityId}`,
    essence: proc?.essence ?? Essence.Informatical,
    backgroundColor: thing.backgroundColor,
    borderColor: thing.borderColor,
    textColor: thing.textColor,
    width: thing.width,
    height: thing.height,
  };

  return {
    id: nodeId,
    type: 'opmProcess',
    position: { x: thing.x, y: thing.y },
    data,
  };
}

function collectThingNodes(
  things: OpdVisualThing[],
  logical: LogicalModel,
): Node[] {
  const nodes: Node[] = [];
  function walk(thing: OpdVisualThing) {
    nodes.push(thingToNode(thing, logical));
    for (const child of thing.children) {
      walk(child);
    }
  }
  for (const t of things) walk(t);
  return nodes;
}

// ─── Link Edges ───────────────────────────────────────────────────────

function linkToEdge(
  link: OpdVisualLink,
  logical: LogicalModel,
  entityNodeMap: Map<number, string>,
): Edge | null {
  const sourceNodeId = entityNodeMap.get(link.sourceId);
  const destNodeId = entityNodeMap.get(link.destinationId);
  if (!sourceNodeId || !destNodeId) return null;

  const logicalLink = logical.links.get(link.entityId);

  return {
    id: `link-${link.entityId}-${link.entityInOpdId}`,
    type: 'opmLink',
    source: sourceNodeId,
    target: destNodeId,
    sourceHandle: connectionSideToHandle(link.sourceConnectionSide, true),
    targetHandle: connectionSideToHandle(link.destinationConnectionSide, false),
    data: {
      linkType: logicalLink?.linkType ?? 302,
      label: logicalLink?.entity.name || undefined,
      condition: logicalLink?.condition || undefined,
    },
  };
}

// ─── Fundamental Relation Edges ───────────────────────────────────────

function fundamentalRelationToEdges(
  group: OpdFundamentalRelationGroup,
  logical: LogicalModel,
  entityNodeMap: Map<number, string>,
): Edge[] {
  const sourceNodeId = entityNodeMap.get(group.sourceId);
  if (!sourceNodeId) return [];

  const edges: Edge[] = [];
  for (const rel of group.relations) {
    const destNodeId = entityNodeMap.get(rel.destinationId);
    if (!destNodeId) continue;

    const logicalRel = logical.relations.get(rel.entityId);

    edges.push({
      id: `frel-${rel.entityId}-${rel.entityInOpdId}`,
      type: 'opmRelation',
      source: sourceNodeId,
      target: destNodeId,
      sourceHandle: connectionSideToHandle(group.sourceConnectionSide, true),
      targetHandle: connectionSideToHandle(rel.destinationSide, false),
      data: {
        relationType: logicalRel?.relationType ?? 202,
        forwardMeaning: logicalRel?.forwardRelationMeaning || undefined,
        backwardMeaning: logicalRel?.backwardRelationMeaning || undefined,
      },
    });
  }
  return edges;
}

// ─── General Relation Edges ──────────────────────────────────────────

function generalRelationToEdge(
  genRel: OpdVisualGeneralRelation,
  logical: LogicalModel,
  entityNodeMap: Map<number, string>,
): Edge | null {
  const line = genRel.lineAttr;
  const sourceNodeId = entityNodeMap.get(line.sourceId);
  const destNodeId = entityNodeMap.get(line.destinationId);
  if (!sourceNodeId || !destNodeId) return null;

  const logicalRel = logical.relations.get(genRel.entityId);

  return {
    id: `grel-${genRel.entityId}-${genRel.entityInOpdId}`,
    type: 'opmRelation',
    source: sourceNodeId,
    target: destNodeId,
    sourceHandle: connectionSideToHandle(line.sourceConnectionSide, true),
    targetHandle: connectionSideToHandle(line.destinationConnectionSide, false),
    data: {
      relationType: logicalRel?.relationType ?? 205,
      label: logicalRel?.entity.name || undefined,
      forwardMeaning: logicalRel?.forwardRelationMeaning || undefined,
      backwardMeaning: logicalRel?.backwardRelationMeaning || undefined,
    },
  };
}

// ─── Main Export ──────────────────────────────────────────────────────

export interface FlowElements {
  nodes: Node[];
  edges: Edge[];
}

export function opdToFlow(
  opd: OpdDiagram,
  logical: LogicalModel,
): FlowElements {
  const entityNodeMap = buildEntityNodeMap(opd.things);
  const nodes = collectThingNodes(opd.things, logical);
  const edges: Edge[] = [];

  // Procedural links
  for (const link of opd.links) {
    const edge = linkToEdge(link, logical, entityNodeMap);
    if (edge) edges.push(edge);
  }

  // Fundamental relations
  for (const group of opd.fundamentalRelations) {
    edges.push(...fundamentalRelationToEdges(group, logical, entityNodeMap));
  }

  // General (tagged) relations
  for (const genRel of opd.generalRelations) {
    const edge = generalRelationToEdge(genRel, logical, entityNodeMap);
    if (edge) edges.push(edge);
  }

  return { nodes, edges };
}
