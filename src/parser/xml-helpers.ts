/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Ensures a value is always an array.
 * fast-xml-parser collapses single-element collections into a plain object.
 */
export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Safely reads an attribute from a parsed XML node.
 * Attributes in fast-xml-parser (with ignoreAttributes: false) appear
 * as direct properties on the node object.
 */
export function getAttr(
  node: any,
  attr: string,
  defaultValue: string = '',
): string {
  if (node == null) return defaultValue;
  const val = node[attr];
  if (val == null) return defaultValue;
  return String(val);
}

/** Reads an attribute as a number */
export function getNumAttr(
  node: any,
  attr: string,
  defaultValue: number = 0,
): number {
  if (node == null) return defaultValue;
  const val = node[attr];
  if (val == null) return defaultValue;
  const num = Number(val);
  return isNaN(num) ? defaultValue : num;
}

/** Reads a boolean attribute ("true"/"false") */
export function getBoolAttr(
  node: any,
  attr: string,
  defaultValue: boolean = false,
): boolean {
  if (node == null) return defaultValue;
  const val = node[attr];
  if (val == null) return defaultValue;
  return String(val).toLowerCase() === 'true';
}

/**
 * Extracts text content from a child element.
 * In fast-xml-parser, `<name>Foo</name>` becomes `{ name: "Foo" }`.
 */
export function getTextContent(
  node: any,
  childName: string,
  defaultValue: string = '',
): string {
  if (node == null) return defaultValue;
  const val = node[childName];
  if (val == null) return defaultValue;
  // If the child has attributes, its text content is in #text
  if (typeof val === 'object' && val['#text'] != null) {
    return String(val['#text']);
  }
  return String(val);
}
