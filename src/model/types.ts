/**
 * OPM Metamodel Type Definitions
 *
 * Three-layer architecture:
 *   Layer A: Shared entity attributes
 *   Layer B: Logical model (semantic, position-free)
 *   Layer C: Visual model (layout, colors, OPD hierarchy)
 */

import type {
  Affiliation,
  ConnectionSide,
  Essence,
  LinkType,
  RelationType,
} from './enums';

// ─── Layer A: Shared Entity Attributes ─────────────────────────────

/** Common attributes shared by all OPM entities */
export interface EntityAttrs {
  id: number;
  name: string;
  description: string;
  url: string;
}

// ─── Layer B: Logical Model ────────────────────────────────────────

/** OPM time duration (7-component format or infinity) */
export interface OpmTime {
  hours: number;
  minutes: number;
  seconds: number;
  centiseconds: number;
  milliseconds: number;
  microseconds: number;
  nanoseconds: number;
  isInfinity: boolean;
}

/** A state belonging to an OpmObject */
export interface OpmState {
  entity: EntityAttrs;
  isInitial: boolean;
  isFinal: boolean;
  isDefault: boolean;
  minTime: OpmTime;
  maxTime: OpmTime;
  locked: boolean;
}

/** An OPM object (thing that exists) */
export interface OpmObject {
  entity: EntityAttrs;
  essence: Essence;
  affiliation: Affiliation;
  states: OpmState[];
  type: string;
  typeOriginId: number;
  persistent: boolean;
  key: boolean;
  indexName: string;
  indexOrder: number;
  initialValue: string;
  numberOfInstances: number;
  role: string;
  scope: number;
  locked: boolean;
}

/** An OPM process (thing that happens) */
export interface OpmProcess {
  entity: EntityAttrs;
  essence: Essence;
  affiliation: Affiliation;
  numberOfInstances: number;
  role: string;
  scope: number;
  processBody: string;
  minTimeActivation: OpmTime;
  maxTimeActivation: OpmTime;
  locked: boolean;
}

/** A structural relation between entities */
export interface OpmRelation {
  entity: EntityAttrs;
  relationType: RelationType;
  sourceId: number;
  destinationId: number;
  sourceCardinality: string;
  destinationCardinality: string;
  forwardRelationMeaning: string;
  backwardRelationMeaning: string;
  locked: boolean;
}

/** A procedural link connecting a process with an object */
export interface OpmLink {
  entity: EntityAttrs;
  linkType: LinkType;
  sourceId: number;
  destinationId: number;
  condition: string;
  path: string;
  minReactionTime: OpmTime;
  maxReactionTime: OpmTime;
  locked: boolean;
}

/** A scenario with initial and final state assignments */
export interface Scenario {
  name: string;
  initialPairs: Array<{ objectId: number; stateId: number }>;
  finalPairs: Array<{ objectId: number; stateId: number }>;
}

/** The complete logical (semantic) model */
export interface LogicalModel {
  objects: Map<number, OpmObject>;
  processes: Map<number, OpmProcess>;
  relations: Map<number, OpmRelation>;
  links: Map<number, OpmLink>;
}

// ─── Layer C: Visual Model ─────────────────────────────────────────

/** Visual representation of a state within an OPD */
export interface OpdVisualState {
  entityId: number;
  entityInOpdId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  visible: boolean;
}

/** Visual representation of an object or process within an OPD */
export interface OpdVisualThing {
  entityId: number;
  entityInOpdId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  layer: number;
  textPosition: string;
  statesAutoArranged: boolean;
  visualStates: OpdVisualState[];
  children: OpdVisualThing[];
  thingType: 'object' | 'process';
}

/** Visual representation of a procedural link within an OPD */
export interface OpdVisualLink {
  entityId: number;
  entityInOpdId: number;
  sourceId: number;
  sourceInOpdId: number;
  sourceConnectionSide: ConnectionSide;
  sourceConnectionParameter: number;
  destinationId: number;
  destinationInOpdId: number;
  destinationConnectionSide: ConnectionSide;
  destinationConnectionParameter: number;
  autoArranged: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

/** Visual representation of one arm of a fundamental relation (Aggregation, Exhibition, etc.) */
export interface OpdVisualFundamentalRelation {
  entityId: number;
  entityInOpdId: number;
  destinationId: number;
  destinationInOpdId: number;
  destinationSide: ConnectionSide;
  destinationParameter: number;
  labelX: number;
  labelY: number;
}

/** A group of fundamental relations sharing a common symbol (triangle/diamond) */
export interface OpdFundamentalRelationGroup {
  sourceId: number;
  sourceInOpdId: number;
  sourceConnectionSide: ConnectionSide;
  sourceConnectionParameter: number;
  symbolX: number;
  symbolY: number;
  symbolWidth: number;
  symbolHeight: number;
  backgroundColor: string;
  borderColor: string;
  relations: OpdVisualFundamentalRelation[];
}

/** Visual representation of a general (tagged) structural relation */
export interface OpdVisualGeneralRelation {
  entityId: number;
  entityInOpdId: number;
  sourceLabelX: number;
  sourceLabelY: number;
  destinationLabelX: number;
  destinationLabelY: number;
  lineAttr: OpdVisualLink;
}

/** OR/XOR grouping of links for logical operators */
export interface OrXorGroup {
  isSourceGroup: boolean;
  type: number;
  members: Array<{ memberId: number; memberInOpdId: number }>;
}

/** A single Object-Process Diagram (OPD) with its visual contents */
export interface OpdDiagram {
  id: number;
  name: string;
  maxEntityEntry: number;
  locked: boolean;
  things: OpdVisualThing[];
  fundamentalRelations: OpdFundamentalRelationGroup[];
  generalRelations: OpdVisualGeneralRelation[];
  links: OpdVisualLink[];
  orXorGroups: OrXorGroup[];
  mainEntity?: OpdVisualThing;
  inZoomedChildren: OpdDiagram[];
  unfoldedChildren: OpdDiagram[];
}

/** The complete visual model (OPD hierarchy) */
export interface VisualModel {
  rootOpd: OpdDiagram;
  allOpds: Map<number, OpdDiagram>;
}

// ─── Top-Level Container ───────────────────────────────────────────

/** The complete OPM model combining logical and visual layers */
export interface OpmModel {
  name: string;
  author: string;
  creationDate: string;
  lastUpdate: string;
  modelType: string;
  globalId: string;
  maxEntityEntry: number;
  maxOpdEntry: number;
  scenarios: Scenario[];
  systemProperties: Record<string, string>;
  logical: LogicalModel;
  visual: VisualModel;
}
