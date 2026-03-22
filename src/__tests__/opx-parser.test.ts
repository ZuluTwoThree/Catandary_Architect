import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { parseOpxBuffer } from '../parser/opx-parser';
import { RelationType, LinkType } from '../model/enums';

const EXAMPLES_DIR = resolve(__dirname, '../../OPCat2/Examples');

function loadExample(filename: string) {
  const buf = readFileSync(join(EXAMPLES_DIR, filename));
  return parseOpxBuffer(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

describe('OPX Parser Integration', () => {
  describe('Order System.opz', () => {
    const model = loadExample('Order System.opz');

    it('parses model metadata', () => {
      expect(model.name).toBe('order system');
      expect(model.author).toBe('iris');
      expect(model.modelType).toBe('System');
    });

    it('parses objects', () => {
      expect(model.logical.objects.size).toBeGreaterThan(0);
      // Check that at least one object has states
      const objectsWithStates = Array.from(model.logical.objects.values()).filter(
        (o) => o.states.length > 0,
      );
      expect(objectsWithStates.length).toBeGreaterThan(0);
    });

    it('parses processes', () => {
      expect(model.logical.processes.size).toBeGreaterThan(0);
    });

    it('parses relations with correct types', () => {
      expect(model.logical.relations.size).toBeGreaterThan(0);
      const relTypes = new Set(
        Array.from(model.logical.relations.values()).map((r) => r.relationType),
      );
      expect(relTypes.has(RelationType.Exhibition)).toBe(true);
    });

    it('parses links with correct types', () => {
      expect(model.logical.links.size).toBeGreaterThan(0);
      const linkTypes = new Set(
        Array.from(model.logical.links.values()).map((l) => l.linkType),
      );
      expect(linkTypes.has(LinkType.Result)).toBe(true);
    });

    it('parses OPD hierarchy', () => {
      expect(model.visual.allOpds.size).toBeGreaterThan(0);
      expect(model.visual.rootOpd.name).toContain('SD');
    });
  });

  describe('ATM.opz', () => {
    const model = loadExample('ATM.opz');

    it('parses model metadata', () => {
      expect(model.name).toBe('ATM');
    });

    it('contains scenarios', () => {
      expect(model.scenarios.length).toBeGreaterThan(0);
      expect(model.scenarios[0].name).toBeTruthy();
    });

    it('has multiple OPDs (in-zoomed hierarchy)', () => {
      expect(model.visual.allOpds.size).toBeGreaterThanOrEqual(5);
    });

    it('contains generalization relations', () => {
      const hasGen = Array.from(model.logical.relations.values()).some(
        (r) => r.relationType === RelationType.Generalization,
      );
      expect(hasGen).toBe(true);
    });

    it('contains invocation links', () => {
      const hasInvocation = Array.from(model.logical.links.values()).some(
        (l) => l.linkType === LinkType.Invocation,
      );
      expect(hasInvocation).toBe(true);
    });
  });

  describe('Travel Management.opz', () => {
    const model = loadExample('Travel Management.opz');

    it('contains all advanced link types', () => {
      const linkTypes = new Set(
        Array.from(model.logical.links.values()).map((l) => l.linkType),
      );
      expect(linkTypes.has(LinkType.Event)).toBe(true);
      expect(linkTypes.has(LinkType.Exception)).toBe(true);
      expect(linkTypes.has(LinkType.InstrumentEvent)).toBe(true);
    });

    it('contains bi-directional tagged relations', () => {
      const hasBiDir = Array.from(model.logical.relations.values()).some(
        (r) => r.relationType === RelationType.BiDirectional,
      );
      expect(hasBiDir).toBe(true);
    });
  });

  describe('All 6 example files parse without errors', () => {
    const files = [
      'ABS.opz',
      'Alzheimer.opz',
      'ATM.opz',
      'Cell Cycle.opz',
      'Order System.opz',
      'Travel Management.opz',
    ];

    for (const file of files) {
      it(`parses ${file}`, () => {
        const model = loadExample(file);
        expect(model.name).toBeTruthy();
        expect(model.logical.objects.size).toBeGreaterThan(0);
        expect(model.logical.processes.size).toBeGreaterThan(0);
        expect(model.visual.allOpds.size).toBeGreaterThan(0);
      });
    }
  });
});
