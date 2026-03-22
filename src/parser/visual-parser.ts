/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConnectionSide } from '../model/enums';
import type {
  OpdDiagram,
  OpdFundamentalRelationGroup,
  OpdVisualFundamentalRelation,
  OpdVisualGeneralRelation,
  OpdVisualLink,
  OpdVisualState,
  OpdVisualThing,
  OrXorGroup,
  VisualModel,
} from '../model/types';
import { javaIntToHex } from './color-converter';
import { ensureArray, getAttr, getBoolAttr, getNumAttr } from './xml-helpers';

// ─── Instance Attributes ───────────────────────────────────────────

function parseInstanceAttr(node: any): {
  entityId: number;
  entityInOpdId: number;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
} {
  const ia = node?.InstanceAttr;
  return {
    entityId: getNumAttr(ia, 'entityId'),
    entityInOpdId: getNumAttr(ia, 'entityInOpdId'),
    backgroundColor: javaIntToHex(getNumAttr(ia, 'backgroundColor', -1)),
    borderColor: javaIntToHex(getNumAttr(ia, 'borderColor', -16777216)),
    textColor: javaIntToHex(getNumAttr(ia, 'textColor', -16777216)),
  };
}

// ─── Visual State ──────────────────────────────────────────────────

function parseVisualState(node: any): OpdVisualState {
  const inst = parseInstanceAttr(node);
  const conn = node?.ConnectionEdgeAttr;
  return {
    entityId: inst.entityId,
    entityInOpdId: inst.entityInOpdId,
    x: getNumAttr(conn, 'x'),
    y: getNumAttr(conn, 'y'),
    width: getNumAttr(conn, 'width'),
    height: getNumAttr(conn, 'height'),
    backgroundColor: inst.backgroundColor,
    borderColor: inst.borderColor,
    textColor: inst.textColor,
    visible: getBoolAttr(node, 'visible', true),
  };
}

// ─── Visual Thing (Object or Process) ──────────────────────────────

function parseVisualThing(vtNode: any): OpdVisualThing {
  const thingData = vtNode?.ThingData;
  // Could be VisualObject or VisualProcess
  const visual = thingData?.VisualObject ?? thingData?.VisualProcess;
  const thingType: 'object' | 'process' = thingData?.VisualObject
    ? 'object'
    : 'process';

  const inst = parseInstanceAttr(visual);
  const conn = visual?.ConnectionEdgeAttr;
  const thingInst = visual?.ThingInstanceAttr;

  const visualStates = ensureArray(visual?.VisualState).map(parseVisualState);
  const children = ensureArray(vtNode?.ChildrenContainer?.VisualThing).map(
    parseVisualThing,
  );

  return {
    entityId: inst.entityId,
    entityInOpdId: inst.entityInOpdId,
    x: getNumAttr(conn, 'x'),
    y: getNumAttr(conn, 'y'),
    width: getNumAttr(conn, 'width'),
    height: getNumAttr(conn, 'height'),
    backgroundColor: inst.backgroundColor,
    borderColor: inst.borderColor,
    textColor: inst.textColor,
    layer: getNumAttr(thingInst, 'layer'),
    textPosition: getAttr(thingInst, 'textPosition', 'C'),
    statesAutoArranged: getBoolAttr(visual, 'statesAutoArranged', true),
    visualStates,
    children,
    thingType,
  };
}

// ─── Visual Link ───────────────────────────────────────────────────

function parseLineAttr(node: any): OpdVisualLink {
  const inst = parseInstanceAttr(node);
  const line = node?.LineAttr;
  return {
    entityId: inst.entityId,
    entityInOpdId: inst.entityInOpdId,
    sourceId: getNumAttr(line, 'sourceId'),
    sourceInOpdId: getNumAttr(line, 'sourceInOpdId'),
    sourceConnectionSide: getNumAttr(line, 'sourceConnectionSide', ConnectionSide.Bottom) as ConnectionSide,
    sourceConnectionParameter: parseFloat(getAttr(line, 'sourceConnectionParameter', '0.5')),
    destinationId: getNumAttr(line, 'destinationId'),
    destinationInOpdId: getNumAttr(line, 'destinationInOpdId'),
    destinationConnectionSide: getNumAttr(line, 'destinationConnectionSide', ConnectionSide.Top) as ConnectionSide,
    destinationConnectionParameter: parseFloat(getAttr(line, 'destinationConnectionParameter', '0.5')),
    autoArranged: getBoolAttr(line, 'autoArranged', true),
    backgroundColor: inst.backgroundColor,
    borderColor: inst.borderColor,
    textColor: inst.textColor,
  };
}

// ─── Fundamental Relations (Aggregation, Exhibition, etc.) ─────────

function parseFundamentalRelationGroup(
  commonPart: any,
): OpdFundamentalRelationGroup {
  const relations: OpdVisualFundamentalRelation[] = ensureArray(
    commonPart?.VisualFundamentalRelation,
  ).map((vfr: any) => {
    const inst = parseInstanceAttr(vfr);
    return {
      entityId: inst.entityId,
      entityInOpdId: inst.entityInOpdId,
      destinationId: getNumAttr(vfr, 'destinationId'),
      destinationInOpdId: getNumAttr(vfr, 'destinationInOpdId'),
      destinationSide: getNumAttr(vfr, 'destinationSide', ConnectionSide.Top) as ConnectionSide,
      destinationParameter: parseFloat(getAttr(vfr, 'destinationParameter', '0.5')),
      labelX: getNumAttr(vfr, 'labelX'),
      labelY: getNumAttr(vfr, 'labelY'),
    };
  });

  return {
    sourceId: getNumAttr(commonPart, 'sourceId'),
    sourceInOpdId: getNumAttr(commonPart, 'sourceInOpdId'),
    sourceConnectionSide: getNumAttr(commonPart, 'sourceConnectionSide', ConnectionSide.Bottom) as ConnectionSide,
    sourceConnectionParameter: parseFloat(
      getAttr(commonPart, 'sourceConnectionParameter', '0.5'),
    ),
    symbolX: getNumAttr(commonPart, 'x'),
    symbolY: getNumAttr(commonPart, 'y'),
    symbolWidth: getNumAttr(commonPart, 'width'),
    symbolHeight: getNumAttr(commonPart, 'height'),
    backgroundColor: javaIntToHex(getNumAttr(commonPart, 'backgroundColor', -1)),
    borderColor: javaIntToHex(getNumAttr(commonPart, 'borderColor', -16777216)),
    relations,
  };
}

// ─── General Relations (Tagged structural) ─────────────────────────

function parseGeneralRelation(node: any): OpdVisualGeneralRelation {
  const inst = parseInstanceAttr(node);
  return {
    entityId: inst.entityId,
    entityInOpdId: inst.entityInOpdId,
    sourceLabelX: getNumAttr(node, 'sourceLabelX'),
    sourceLabelY: getNumAttr(node, 'sourceLabelY'),
    destinationLabelX: getNumAttr(node, 'destinationLabelX'),
    destinationLabelY: getNumAttr(node, 'destinationLabelY'),
    lineAttr: parseLineAttr(node),
  };
}

// ─── OR/XOR Groups ─────────────────────────────────────────────────

function parseOrXorGroup(node: any): OrXorGroup {
  return {
    isSourceGroup: getBoolAttr(node, 'isSourceGroup'),
    type: getNumAttr(node, 'type'),
    members: ensureArray(node?.Member).map((m: any) => ({
      memberId: getNumAttr(m, 'memberId'),
      memberInOpdId: getNumAttr(m, 'memberInOpdId'),
    })),
  };
}

// ─── OPD Parsing (recursive for InZoomed/Unfolded) ─────────────────

function parseOpdContents(opdNode: any): OpdDiagram {
  const things: OpdVisualThing[] = ensureArray(
    opdNode?.ThingSection?.VisualThing,
  ).map(parseVisualThing);

  const fundamentalRelations: OpdFundamentalRelationGroup[] = ensureArray(
    opdNode?.FundamentalRelationSection?.CommonPart,
  ).map(parseFundamentalRelationGroup);

  const generalRelations: OpdVisualGeneralRelation[] = ensureArray(
    opdNode?.GeneralRelationSection?.VisualGeneralRelation,
  ).map(parseGeneralRelation);

  const links: OpdVisualLink[] = ensureArray(
    opdNode?.VisualLinkSection?.VisualLink,
  ).map(parseLineAttr);

  const orXorGroups: OrXorGroup[] = ensureArray(
    opdNode?.VisualLinkSection?.OrXorGroup,
  ).map(parseOrXorGroup);

  // Parse main entity for in-zoomed/unfolded diagrams
  let mainEntity: OpdVisualThing | undefined;
  const mainEntityNode = opdNode?.MainEntity?.VisualThing;
  if (mainEntityNode) {
    mainEntity = parseVisualThing(mainEntityNode);
  }

  // Recursively parse InZoomed children
  // An <InZoomed> block can contain multiple sibling <OPD> elements
  const inZoomedChildren: OpdDiagram[] = [];
  for (const iz of ensureArray(opdNode?.InZoomed)) {
    for (const childOpd of ensureArray(iz?.OPD)) {
      inZoomedChildren.push(parseOpdContents(childOpd));
    }
  }

  // Recursively parse Unfolded children
  const unfoldedChildren: OpdDiagram[] = [];
  for (const uf of ensureArray(opdNode?.Unfolded)) {
    for (const childOpd of ensureArray(uf?.OPD)) {
      unfoldedChildren.push(parseOpdContents(childOpd));
    }
  }

  return {
    id: getNumAttr(opdNode, 'id'),
    name: getAttr(opdNode, 'name', 'SD'),
    maxEntityEntry: getNumAttr(opdNode, 'maxEntityEntry'),
    locked: getBoolAttr(opdNode, 'locked'),
    things,
    fundamentalRelations,
    generalRelations,
    links,
    orXorGroups,
    mainEntity,
    inZoomedChildren,
    unfoldedChildren,
  };
}

// ─── Collect all OPDs into a flat map ──────────────────────────────

function collectOpds(opd: OpdDiagram, map: Map<number, OpdDiagram>): void {
  map.set(opd.id, opd);
  for (const child of opd.inZoomedChildren) {
    collectOpds(child, map);
  }
  for (const child of opd.unfoldedChildren) {
    collectOpds(child, map);
  }
}

// ─── Main Export ───────────────────────────────────────────────────

export function parseVisualPart(visualPartNode: any): VisualModel {
  const rootOpdNode = visualPartNode?.OPD;
  const rootOpd = parseOpdContents(rootOpdNode);

  const allOpds = new Map<number, OpdDiagram>();
  collectOpds(rootOpd, allOpds);

  return { rootOpd, allOpds };
}
