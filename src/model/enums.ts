/**
 * OPM Metamodel Enumerations
 * Based on reverse-engineered OPX file format (OPCat 2 / OPM ISO 19450)
 */

/** Structural relation types between entities */
export enum RelationType {
  Aggregation = 201,
  Exhibition = 202,
  Instantiation = 203,
  Generalization = 204,
  UniDirectional = 205,
  BiDirectional = 206,
}

/** Procedural link types connecting processes with objects */
export enum LinkType {
  Consumption = 301,
  Effect = 302,
  Instrument = 303,
  Condition = 304,
  Agent = 305,
  Result = 306,
  Invocation = 307,
  Event = 308,
  Exception = 309,
  InstrumentEvent = 310,
}

/** Connection side for visual link endpoints */
export enum ConnectionSide {
  Top = 1,
  Right = 4,
  Bottom = 7,
  Left = 8,
}

/** Physical vs. informatical essence of a thing */
export enum Essence {
  Informatical = 'informatical',
  Physical = 'physical',
}

/** Systemic vs. environmental affiliation of a thing */
export enum Affiliation {
  Systemic = 'systemic',
  Environmental = 'environmental',
}

/** Text position within a visual thing */
export enum TextPosition {
  Center = 'C',
  North = 'N',
  South = 'S',
  East = 'E',
  West = 'W',
  NorthEast = 'NE',
  NorthWest = 'NW',
  SouthEast = 'SE',
  SouthWest = 'SW',
}

/** Human-readable labels for relation types */
export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  [RelationType.Aggregation]: 'Aggregation-Participation',
  [RelationType.Exhibition]: 'Exhibition-Featuring',
  [RelationType.Instantiation]: 'Classification-Instantiation',
  [RelationType.Generalization]: 'Generalization-Specialization',
  [RelationType.UniDirectional]: 'Uni-Directional Tagged',
  [RelationType.BiDirectional]: 'Bi-Directional Tagged',
};

/** Human-readable labels for link types */
export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  [LinkType.Consumption]: 'Consumption',
  [LinkType.Effect]: 'Effect',
  [LinkType.Instrument]: 'Instrument',
  [LinkType.Condition]: 'Condition',
  [LinkType.Agent]: 'Agent',
  [LinkType.Result]: 'Result',
  [LinkType.Invocation]: 'Invocation',
  [LinkType.Event]: 'Event',
  [LinkType.Exception]: 'Exception',
  [LinkType.InstrumentEvent]: 'Instrument-Event',
};
