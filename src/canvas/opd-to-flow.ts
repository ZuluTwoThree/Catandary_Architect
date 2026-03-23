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
import { ConnectionSide, Essence, RelationType } from '../model/enums';
import type { OpmObjectNodeData } from './nodes/OpmObjectNode';
import type { OpmProcessNodeData } from './nodes/OpmProcessNode';
import type { OpmRelationSymbolNodeData } from './nodes/OpmRelationSymbolNode';

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Snaps a connection parameter (0.0–1.0) to the nearest handle percent.
 * Handles exist at 10%, 30%, 50%, 70%, 90% on each side.
 */
const HANDLE_PERCENTS = [10, 30, 50, 70, 90];

function snapToPercent(param: number): number {
  const target = param * 100;
  return HANDLE_PERCENTS.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  );
}

function sideLabel(side: ConnectionSide): string {
  switch (side) {
    case ConnectionSide.Top:    return 'top';
    case ConnectionSide.Bottom: return 'bottom';
    case ConnectionSide.Left:   return 'left';
    case ConnectionSide.Right:  return 'right';
    default:                    return 'top';
  }
}

/** Generate a source handle ID: "{side}-{percent}-out" */
function makeSourceHandle(side: ConnectionSide, param: number = 0.5): string {
  return `${sideLabel(side)}-${snapToPercent(param)}-out`;
}

/** Generate a target handle ID: "{side}-{percent}" */
function makeTargetHandle(side: ConnectionSide, param: number = 0.5): string {
  return `${sideLabel(side)}-${snapToPercent(param)}`;
}

function oppositeSide(side: ConnectionSide): ConnectionSide {
  switch (side) {
    case ConnectionSide.Top:    return ConnectionSide.Bottom;
    case ConnectionSide.Bottom: return ConnectionSide.Top;
    case ConnectionSide.Left:   return ConnectionSide.Right;
    case ConnectionSide.Right:  return ConnectionSide.Left;
    default:                    return ConnectionSide.Top;
  }
}

/** Collect all visual things from an OPD, including mainEntity children */
function allThings(opd: OpdDiagram): OpdVisualThing[] {
  const result = [...opd.things];
  if (opd.mainEntity) {
    for (const child of opd.mainEntity.children) {
      result.push(child);
    }
  }
  return result;
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
      entityId: thing.entityId,
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
    entityId: thing.entityId,
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
    sourceHandle: makeSourceHandle(link.sourceConnectionSide, link.sourceConnectionParameter),
    targetHandle: makeTargetHandle(link.destinationConnectionSide, link.destinationConnectionParameter),
    data: {
      linkType: logicalLink?.linkType ?? 302,
      condition: logicalLink?.condition || undefined,
    },
  };
}

// ─── Fundamental Relation: Symbol Node + Hub Edges ────────────────────

/**
 * In OPM, fundamental relations (Exhibition, Aggregation, Generalization,
 * Instantiation) use a shared symbol (triangle) as a visual hub:
 *
 *   Source ──── △ ──── Dest1
 *                ├─── Dest2
 *                └─── Dest3
 *
 * We render this as:
 *   1. A small "relation symbol" node at the symbol position
 *   2. One edge: Source → Symbol (plain line, no markers)
 *   3. N edges: Symbol → each Destination (plain lines, no markers)
 */
function fundamentalRelationToElements(
  group: OpdFundamentalRelationGroup,
  logical: LogicalModel,
  entityNodeMap: Map<number, string>,
): { nodes: Node[]; edges: Edge[] } {
  const sourceNodeId = entityNodeMap.get(group.sourceId);
  if (!sourceNodeId) return { nodes: [], edges: [] };

  // Determine relation type from the first relation in the group
  const firstRel = group.relations[0];
  const logicalRel = firstRel ? logical.relations.get(firstRel.entityId) : undefined;
  const relationType = logicalRel?.relationType ?? RelationType.Exhibition;

  // Create the symbol node ID
  const symbolNodeId = `relsym-${group.sourceId}-${group.sourceInOpdId}`;

  // Symbol node at the CommonPart position
  const symbolNode: Node = {
    id: symbolNodeId,
    type: 'opmRelationSymbol',
    position: { x: group.symbolX, y: group.symbolY },
    data: {
      relationType,
      width: group.symbolWidth || 16,
      height: group.symbolHeight || 16,
    } satisfies OpmRelationSymbolNodeData,
  };

  const edges: Edge[] = [];

  // Determine which side of the symbol faces the source
  // The source connection side tells us which side of the SOURCE the line leaves from.
  // The symbol should receive on the opposite side (e.g., source leaves from bottom → symbol receives on top)
  const symbolReceiveSide = oppositeSide(group.sourceConnectionSide);

  // Edge: Source → Symbol (straight line, no markers)
  edges.push({
    id: `frel-src-${group.sourceId}-${group.sourceInOpdId}`,
    type: 'straight',
    source: sourceNodeId,
    target: symbolNodeId,
    sourceHandle: makeSourceHandle(group.sourceConnectionSide, group.sourceConnectionParameter),
    targetHandle: makeTargetHandle(symbolReceiveSide),
    style: { stroke: '#000', strokeWidth: 1.5 },
  });

  // Edges: Symbol → each Destination (straight lines, no markers)
  for (const rel of group.relations) {
    const destNodeId = entityNodeMap.get(rel.destinationId);
    if (!destNodeId) continue;

    // The destination side tells us which side of the DESTINATION the line arrives at.
    // The symbol should send from the opposite side
    const symbolSendSide = oppositeSide(rel.destinationSide);

    edges.push({
      id: `frel-dst-${rel.entityId}-${rel.entityInOpdId}`,
      type: 'straight',
      source: symbolNodeId,
      target: destNodeId,
      sourceHandle: makeSourceHandle(symbolSendSide),
      targetHandle: makeTargetHandle(rel.destinationSide, rel.destinationParameter),
      style: { stroke: '#000', strokeWidth: 1.5 },
    });
  }

  return { nodes: [symbolNode], edges };
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
    sourceHandle: makeSourceHandle(line.sourceConnectionSide, line.sourceConnectionParameter),
    targetHandle: makeTargetHandle(line.destinationConnectionSide, line.destinationConnectionParameter),
    data: {
      relationType: logicalRel?.relationType ?? 205,
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
  const things = allThings(opd);
  const entityNodeMap = buildEntityNodeMap(things);
  const nodes = collectThingNodes(things, logical);
  const edges: Edge[] = [];

  // Procedural links
  for (const link of opd.links) {
    const edge = linkToEdge(link, logical, entityNodeMap);
    if (edge) edges.push(edge);
  }

  // Fundamental relations (symbol node + hub edges)
  for (const group of opd.fundamentalRelations) {
    const elements = fundamentalRelationToElements(group, logical, entityNodeMap);
    nodes.push(...elements.nodes);
    edges.push(...elements.edges);
  }

  // General (tagged) relations
  for (const genRel of opd.generalRelations) {
    const edge = generalRelationToEdge(genRel, logical, entityNodeMap);
    if (edge) edges.push(edge);
  }

  return { nodes, edges };
}
