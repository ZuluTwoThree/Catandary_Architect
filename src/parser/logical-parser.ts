/* eslint-disable @typescript-eslint/no-explicit-any */
import { Affiliation, Essence, LinkType, RelationType } from '../model/enums';
import type {
  EntityAttrs,
  LogicalModel,
  OpmLink,
  OpmObject,
  OpmProcess,
  OpmRelation,
  OpmState,
  Scenario,
} from '../model/types';
import { parseOpmTime } from './time-parser';
import { ensureArray, getAttr, getBoolAttr, getNumAttr, getTextContent } from './xml-helpers';

// ─── Entity Attribute Parsing ──────────────────────────────────────

function parseEntityAttrs(node: any): EntityAttrs {
  const ea = node?.EntityAttr;
  return {
    id: getNumAttr(ea, 'id'),
    name: getTextContent(ea, 'name'),
    description: getTextContent(ea, 'description'),
    url: getTextContent(ea, 'url'),
  };
}

function parseEssence(thingAttr: any): Essence {
  return getBoolAttr(thingAttr, 'physical') ? Essence.Physical : Essence.Informatical;
}

function parseAffiliation(entityAttr: any): Affiliation {
  return getBoolAttr(entityAttr, 'environmental')
    ? Affiliation.Environmental
    : Affiliation.Systemic;
}

// ─── State Parsing ─────────────────────────────────────────────────

function parseState(node: any): OpmState {
  return {
    entity: parseEntityAttrs(node),
    isInitial: getBoolAttr(node, 'initial'),
    isFinal: getBoolAttr(node, 'final'),
    isDefault: getBoolAttr(node, 'default'),
    minTime: parseOpmTime(getAttr(node, 'minTime')),
    maxTime: parseOpmTime(getAttr(node, 'maxTime')),
    locked: getBoolAttr(node, 'locked'),
  };
}

// ─── Object Parsing ────────────────────────────────────────────────

function parseObject(node: any): OpmObject {
  const thingAttr = node?.ThingAttr;
  const entityAttr = node?.EntityAttr;
  return {
    entity: parseEntityAttrs(node),
    essence: parseEssence(thingAttr),
    affiliation: parseAffiliation(entityAttr),
    states: ensureArray(node?.LogicalState).map(parseState),
    type: getAttr(node, 'type'),
    typeOriginId: getNumAttr(node, 'typeOriginId', -1),
    persistent: getBoolAttr(node, 'persistent'),
    key: getBoolAttr(node, 'key'),
    indexName: getAttr(node, 'indexName'),
    indexOrder: getNumAttr(node, 'indexOrder'),
    initialValue: getAttr(node, 'initialValue'),
    numberOfInstances: getNumAttr(thingAttr, 'numberOfInstances', 1),
    role: getAttr(thingAttr, 'role'),
    scope: getNumAttr(thingAttr, 'scope'),
    locked: getBoolAttr(node, 'locked'),
  };
}

// ─── Process Parsing ───────────────────────────────────────────────

function parseProcess(node: any): OpmProcess {
  const thingAttr = node?.ThingAttr;
  const entityAttr = node?.EntityAttr;
  return {
    entity: parseEntityAttrs(node),
    essence: parseEssence(thingAttr),
    affiliation: parseAffiliation(entityAttr),
    numberOfInstances: getNumAttr(thingAttr, 'numberOfInstances', 1),
    role: getAttr(thingAttr, 'role'),
    scope: getNumAttr(thingAttr, 'scope'),
    processBody: getTextContent(node, 'processBody', 'none'),
    minTimeActivation: parseOpmTime(getAttr(node, 'minTimeActivation')),
    maxTimeActivation: parseOpmTime(getAttr(node, 'maxTimeActivation')),
    locked: getBoolAttr(node, 'locked'),
  };
}

// ─── Relation Parsing ──────────────────────────────────────────────

function parseRelation(node: any): OpmRelation {
  return {
    entity: parseEntityAttrs(node),
    relationType: getNumAttr(node, 'relationType') as RelationType,
    sourceId: getNumAttr(node, 'sourceId'),
    destinationId: getNumAttr(node, 'destinationId'),
    sourceCardinality: getAttr(node, 'sourceCardinality', '1'),
    destinationCardinality: getAttr(node, 'destinationCardinality', '1'),
    forwardRelationMeaning: getAttr(node, 'forwardRelationMeaning'),
    backwardRelationMeaning: getAttr(node, 'backwardRelationMeaning'),
    locked: getBoolAttr(node, 'locked'),
  };
}

// ─── Link Parsing ──────────────────────────────────────────────────

function parseLink(node: any): OpmLink {
  return {
    entity: parseEntityAttrs(node),
    linkType: getNumAttr(node, 'linkType') as LinkType,
    sourceId: getNumAttr(node, 'sourceId'),
    destinationId: getNumAttr(node, 'destinationId'),
    condition: getAttr(node, 'condition'),
    path: getAttr(node, 'path'),
    minReactionTime: parseOpmTime(getAttr(node, 'minReactionTime')),
    maxReactionTime: parseOpmTime(getAttr(node, 'maxReactionTime')),
    locked: getBoolAttr(node, 'locked'),
  };
}

// ─── Scenario Parsing ──────────────────────────────────────────────

function parseScenarios(scenariosNode: any): Scenario[] {
  return ensureArray(scenariosNode?.Scenario).map((s: any) => {
    const initialPairs: Array<{ objectId: number; stateId: number }> = [];
    const finalPairs: Array<{ objectId: number; stateId: number }> = [];

    for (const t of ensureArray(s?.types)) {
      const pairs = ensureArray(t?.pairs).map((p: any) => ({
        objectId: getNumAttr(p, 'ObjectID'),
        stateId: getNumAttr(p, 'StateID'),
      }));
      if (getAttr(t, 'type') === 'initial') {
        initialPairs.push(...pairs);
      } else {
        finalPairs.push(...pairs);
      }
    }

    return {
      name: getAttr(s, 'ScenName'),
      initialPairs,
      finalPairs,
    };
  });
}

// ─── System Properties Parsing ─────────────────────────────────────

function parseSystemProperties(node: any): Record<string, string> {
  const props: Record<string, string> = {};
  const sections = [node?.SystemConfiguration, node?.GeneralInfo];
  for (const section of sections) {
    if (!section) continue;
    for (const prop of ensureArray(section?.Property)) {
      const key = getAttr(prop, 'key');
      const value = getTextContent(prop, 'value');
      if (key) props[key] = value;
    }
  }
  return props;
}

// ─── Main Export ───────────────────────────────────────────────────

export function parseLogicalStructure(logicalNode: any): LogicalModel {
  const objects = new Map<number, OpmObject>();
  const processes = new Map<number, OpmProcess>();
  const relations = new Map<number, OpmRelation>();
  const links = new Map<number, OpmLink>();

  for (const node of ensureArray(logicalNode?.ObjectSection?.LogicalObject)) {
    const obj = parseObject(node);
    objects.set(obj.entity.id, obj);
  }

  for (const node of ensureArray(logicalNode?.ProcessSection?.LogicalProcess)) {
    const proc = parseProcess(node);
    processes.set(proc.entity.id, proc);
  }

  for (const node of ensureArray(logicalNode?.RelationSection?.LogicalRelation)) {
    const rel = parseRelation(node);
    relations.set(rel.entity.id, rel);
  }

  for (const node of ensureArray(logicalNode?.LinkSection?.LogicalLink)) {
    const link = parseLink(node);
    links.set(link.entity.id, link);
  }

  return { objects, processes, relations, links };
}

export { parseScenarios, parseSystemProperties };
