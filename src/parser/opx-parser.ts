import { inflate } from 'pako';
import { XMLParser } from 'fast-xml-parser';
import type { OpmModel } from '../model/types';
import {
  parseLogicalStructure,
  parseScenarios,
  parseSystemProperties,
} from './logical-parser';
import { parseVisualPart } from './visual-parser';
import { getAttr, getNumAttr } from './xml-helpers';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseAttributeValue: false,
  trimValues: true,
  // Preserve text content of elements that also have attributes
  textNodeName: '#text',
});

/**
 * Detects if data starts with gzip magic bytes (0x1f 0x8b)
 */
function isGzipped(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;
}

/**
 * Parses an OPX/OPZ buffer into an OpmModel.
 * Handles both gzip-compressed (.opz) and raw XML (.opx) input.
 */
export function parseOpxBuffer(buffer: ArrayBuffer): OpmModel {
  const bytes = new Uint8Array(buffer);

  // Decompress if gzipped
  const xmlBytes = isGzipped(bytes) ? inflate(bytes) : bytes;

  // Decode to string
  const xmlString = new TextDecoder('utf-8').decode(xmlBytes);

  return parseOpxString(xmlString);
}

/**
 * Parses an OPX XML string into an OpmModel.
 */
export function parseOpxString(xml: string): OpmModel {
  const doc = xmlParser.parse(xml);
  const system = doc?.OPX?.OPMSystem;

  if (!system) {
    throw new Error('Invalid OPX file: missing OPX/OPMSystem root element');
  }

  const logical = parseLogicalStructure(system?.LogicalStructure);
  const visual = parseVisualPart(system?.VisualPart);
  const scenarios = parseScenarios(system?.Scenarios);
  const systemProperties = parseSystemProperties(system?.SystemProperties);

  return {
    name: getAttr(system, 'name'),
    author: getAttr(system, 'author'),
    creationDate: getAttr(system, 'creationDate'),
    lastUpdate: getAttr(system, 'lastUpdate'),
    modelType: getAttr(system, 'modeltype', 'System'),
    globalId: getAttr(system, 'global-id'),
    maxEntityEntry: getNumAttr(system, 'maxEntityEntry'),
    maxOpdEntry: getNumAttr(system, 'maxOpdEntry'),
    scenarios,
    systemProperties,
    logical,
    visual,
  };
}
