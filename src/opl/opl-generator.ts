/**
 * OPL (Object-Process Language) Generator
 *
 * Generates formal English OPL sentences from the logical OPM model
 * according to ISO 19450 grammar rules.
 *
 * Sentence types:
 *   - Entity declarations (objects, processes, states)
 *   - Structural relation sentences (Exhibition, Aggregation, etc.)
 *   - Procedural link sentences (Consumption, Effect, Agent, etc.)
 */

import type { LogicalModel, OpmObject, OpmProcess, OpmRelation, OpmLink } from '../model/types';
import { RelationType, LinkType, Essence, Affiliation } from '../model/enums';

// ─── Helpers ──────────────────────────────────────────────────────────

function entityName(logical: LogicalModel, id: number): string {
  const obj = logical.objects.get(id);
  if (obj) return obj.entity.name;
  const proc = logical.processes.get(id);
  if (proc) return proc.entity.name;
  // Could be a state
  for (const o of logical.objects.values()) {
    const state = o.states.find((s) => s.entity.id === id);
    if (state) return state.entity.name;
  }
  return `Entity ${id}`;
}

function bold(text: string): string {
  return `**${text}**`;
}

function italic(text: string): string {
  return `*${text}*`;
}

// ─── Entity Declarations ─────────────────────────────────────────────

export interface OplSentence {
  text: string;
  entityIds: number[];
  type: 'declaration' | 'relation' | 'link';
}

function generateObjectDeclaration(obj: OpmObject): OplSentence {
  const parts: string[] = [];
  const name = bold(obj.entity.name);

  // Basic declaration
  parts.push(`${name} is ${italic(obj.essence === Essence.Physical ? 'physical' : 'informatical')}.`);

  // Affiliation
  if (obj.affiliation === Affiliation.Environmental) {
    parts.push(`${name} is ${italic('environmental')}.`);
  }

  // States
  if (obj.states.length > 0) {
    const stateNames = obj.states.map((s) => {
      let statePart = bold(s.entity.name);
      const modifiers: string[] = [];
      if (s.isInitial) modifiers.push('initial');
      if (s.isDefault) modifiers.push('default');
      if (s.isFinal) modifiers.push('final');
      if (modifiers.length > 0) {
        statePart += ` (which is ${modifiers.join(' and ')})`;
      }
      return statePart;
    });
    parts.push(`${name} can be ${joinList(stateNames)}.`);
  }

  return {
    text: parts.join(' '),
    entityIds: [obj.entity.id, ...obj.states.map((s) => s.entity.id)],
    type: 'declaration',
  };
}

function generateProcessDeclaration(proc: OpmProcess): OplSentence {
  const parts: string[] = [];
  const name = bold(proc.entity.name);

  parts.push(`${name} is ${italic(proc.essence === Essence.Physical ? 'physical' : 'informatical')}.`);

  if (proc.affiliation === Affiliation.Environmental) {
    parts.push(`${name} is ${italic('environmental')}.`);
  }

  return {
    text: parts.join(' '),
    entityIds: [proc.entity.id],
    type: 'declaration',
  };
}

// ─── Structural Relation Sentences ───────────────────────────────────

function generateRelationSentence(
  rel: OpmRelation,
  logical: LogicalModel,
): OplSentence {
  const source = entityName(logical, rel.sourceId);
  const dest = entityName(logical, rel.destinationId);

  let text: string;

  switch (rel.relationType) {
    case RelationType.Exhibition:
      text = `${bold(source)} ${italic('exhibits')} ${bold(dest)}.`;
      break;

    case RelationType.Aggregation:
      text = `${bold(source)} ${italic('consists of')} ${bold(dest)}.`;
      break;

    case RelationType.Generalization:
      text = `${bold(dest)} ${italic('is a')} ${bold(source)}.`;
      break;

    case RelationType.Instantiation:
      text = `${bold(dest)} ${italic('is an instance of')} ${bold(source)}.`;
      break;

    case RelationType.UniDirectional: {
      const meaning = rel.forwardRelationMeaning || 'relates to';
      text = `${bold(source)} ${italic(meaning)} ${bold(dest)}.`;
      break;
    }

    case RelationType.BiDirectional: {
      const fwd = rel.forwardRelationMeaning || 'relates to';
      const bwd = rel.backwardRelationMeaning || 'relates to';
      text = `${bold(source)} ${italic(fwd)} ${bold(dest)}, and ${bold(dest)} ${italic(bwd)} ${bold(source)}.`;
      break;
    }

    default:
      text = `${bold(source)} is related to ${bold(dest)}.`;
  }

  return {
    text,
    entityIds: [rel.sourceId, rel.destinationId],
    type: 'relation',
  };
}

// ─── Procedural Link Sentences ───────────────────────────────────────

function generateLinkSentence(
  link: OpmLink,
  logical: LogicalModel,
): OplSentence {
  const source = entityName(logical, link.sourceId);
  const dest = entityName(logical, link.destinationId);

  let text: string;

  switch (link.linkType) {
    case LinkType.Consumption:
      text = `${bold(source)} ${italic('consumes')} ${bold(dest)}.`;
      break;

    case LinkType.Effect:
      text = `${bold(source)} ${italic('affects')} ${bold(dest)}.`;
      break;

    case LinkType.Result:
      text = `${bold(source)} ${italic('yields')} ${bold(dest)}.`;
      break;

    case LinkType.Instrument:
      text = `${bold(source)} ${italic('requires')} ${bold(dest)}.`;
      break;

    case LinkType.Agent:
      text = `${bold(dest)} ${italic('handles')} ${bold(source)}.`;
      break;

    case LinkType.Condition:
      text = `${bold(source)} ${italic('occurs if')} ${bold(dest)} is in the required state.`;
      break;

    case LinkType.Invocation:
      text = `${bold(source)} ${italic('invokes')} ${bold(dest)}.`;
      break;

    case LinkType.Event:
      text = `${bold(dest)} ${italic('triggers')} ${bold(source)}.`;
      break;

    case LinkType.Exception:
      text = `${bold(source)} ${italic('triggers')} ${bold(dest)} on exception.`;
      break;

    case LinkType.InstrumentEvent:
      text = `${bold(dest)} ${italic('requires and triggers')} ${bold(source)}.`;
      break;

    default:
      text = `${bold(source)} is linked to ${bold(dest)}.`;
  }

  // Add condition annotation if present
  if (link.condition) {
    text = text.replace('.', `, ${italic('if')} ${link.condition}.`);
  }

  return {
    text,
    entityIds: [link.sourceId, link.destinationId],
    type: 'link',
  };
}

// ─── Exhibition Grouping ─────────────────────────────────────────────

/**
 * Groups exhibition relations by source to generate combined sentences:
 * "Patient exhibits Name, Age, Education, Insurance, and Gender."
 */
function groupRelationsBySourceAndType(
  relations: OpmRelation[],
): Map<string, OpmRelation[]> {
  const groups = new Map<string, OpmRelation[]>();
  for (const rel of relations) {
    const key = `${rel.sourceId}-${rel.relationType}`;
    const group = groups.get(key) ?? [];
    group.push(rel);
    groups.set(key, group);
  }
  return groups;
}

function generateGroupedRelationSentence(
  rels: OpmRelation[],
  logical: LogicalModel,
): OplSentence {
  if (rels.length === 1) {
    return generateRelationSentence(rels[0], logical);
  }

  const rel = rels[0];
  const source = entityName(logical, rel.sourceId);
  const dests = rels.map((r) => bold(entityName(logical, r.destinationId)));
  const allEntityIds = [rel.sourceId, ...rels.map((r) => r.destinationId)];

  let text: string;
  switch (rel.relationType) {
    case RelationType.Exhibition:
      text = `${bold(source)} ${italic('exhibits')} ${joinList(dests)}.`;
      break;
    case RelationType.Aggregation:
      text = `${bold(source)} ${italic('consists of')} ${joinList(dests)}.`;
      break;
    case RelationType.Generalization:
      text = `${joinList(dests)} ${italic('are')} ${bold(source)}.`;
      break;
    default:
      // For other types, generate individual sentences
      return generateRelationSentence(rels[0], logical);
  }

  return { text, entityIds: allEntityIds, type: 'relation' };
}

// ─── Link Grouping ───────────────────────────────────────────────────

/**
 * Groups links by process and type to generate combined sentences:
 * "Dementia Diagnosing & Managing requires Patient and affects Patient."
 */
function groupLinksBySourceAndType(
  links: OpmLink[],
): Map<string, OpmLink[]> {
  const groups = new Map<string, OpmLink[]>();
  for (const link of links) {
    const key = `${link.sourceId}-${link.linkType}`;
    const group = groups.get(key) ?? [];
    group.push(link);
    groups.set(key, group);
  }
  return groups;
}

function generateGroupedLinkSentence(
  links: OpmLink[],
  logical: LogicalModel,
): OplSentence {
  if (links.length === 1) {
    return generateLinkSentence(links[0], logical);
  }

  const link = links[0];
  const source = entityName(logical, link.sourceId);
  const dests = links.map((l) => bold(entityName(logical, l.destinationId)));
  const allEntityIds = [link.sourceId, ...links.map((l) => l.destinationId)];

  let text: string;
  switch (link.linkType) {
    case LinkType.Consumption:
      text = `${bold(source)} ${italic('consumes')} ${joinList(dests)}.`;
      break;
    case LinkType.Effect:
      text = `${bold(source)} ${italic('affects')} ${joinList(dests)}.`;
      break;
    case LinkType.Result:
      text = `${bold(source)} ${italic('yields')} ${joinList(dests)}.`;
      break;
    case LinkType.Instrument:
      text = `${bold(source)} ${italic('requires')} ${joinList(dests)}.`;
      break;
    case LinkType.Agent:
      text = `${joinList(dests)} ${italic('handle')} ${bold(source)}.`;
      break;
    default:
      return generateLinkSentence(links[0], logical);
  }

  return { text, entityIds: allEntityIds, type: 'link' };
}

// ─── List Joining ────────────────────────────────────────────────────

function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

// ─── Main Export ─────────────────────────────────────────────────────

/**
 * Generates all OPL sentences for the entire logical model.
 */
export function generateOplSentences(logical: LogicalModel): OplSentence[] {
  const sentences: OplSentence[] = [];

  // 1. Object declarations (with states)
  for (const obj of logical.objects.values()) {
    sentences.push(generateObjectDeclaration(obj));
  }

  // 2. Process declarations
  for (const proc of logical.processes.values()) {
    sentences.push(generateProcessDeclaration(proc));
  }

  // 3. Structural relations (grouped by source + type)
  const relGroups = groupRelationsBySourceAndType(
    Array.from(logical.relations.values()),
  );
  for (const rels of relGroups.values()) {
    sentences.push(generateGroupedRelationSentence(rels, logical));
  }

  // 4. Procedural links (grouped by source + type)
  const linkGroups = groupLinksBySourceAndType(
    Array.from(logical.links.values()),
  );
  for (const links of linkGroups.values()) {
    sentences.push(generateGroupedLinkSentence(links, logical));
  }

  return sentences;
}

/**
 * Generates OPL sentences filtered to entities visible in a specific OPD.
 */
export function generateOplForOpd(
  logical: LogicalModel,
  opdEntityIds: Set<number>,
): OplSentence[] {
  const all = generateOplSentences(logical);
  return all.filter((s) =>
    s.entityIds.some((id) => opdEntityIds.has(id)),
  );
}
