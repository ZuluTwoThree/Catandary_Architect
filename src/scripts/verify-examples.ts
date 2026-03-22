import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { parseOpxBuffer } from '../parser/opx-parser';
import { LINK_TYPE_LABELS, RELATION_TYPE_LABELS, LinkType, RelationType } from '../model/enums';
import type { OpdDiagram } from '../model/types';

const examplesDir = resolve(process.argv[2] || './OPCat2/Examples');

function printOpdTree(opd: OpdDiagram, indent: number = 0): void {
  const prefix = '  '.repeat(indent);
  const thingCount = opd.things.length;
  const linkCount = opd.links.length;
  console.log(`${prefix}[OPD ${opd.id}] "${opd.name}" (${thingCount} things, ${linkCount} links)`);
  for (const child of opd.inZoomedChildren) {
    printOpdTree(child, indent + 1);
  }
  for (const child of opd.unfoldedChildren) {
    printOpdTree(child, indent + 1);
  }
}

console.log('=== Catandary Architect: OPX Verification ===\n');
console.log(`Examples directory: ${examplesDir}\n`);

const files = readdirSync(examplesDir).filter((f) => f.endsWith('.opz') || f.endsWith('.opx'));

for (const file of files) {
  const filePath = join(examplesDir, file);
  const buffer = readFileSync(filePath);

  try {
    const model = parseOpxBuffer(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));

    console.log(`━━━ ${file} ━━━`);
    console.log(`  Model: ${model.name}`);
    console.log(`  Author: ${model.author}`);
    console.log(`  Created: ${model.creationDate}`);
    console.log(`  Updated: ${model.lastUpdate}`);
    console.log(`  Scenarios: ${model.scenarios.length}`);
    console.log();

    // Logical model stats
    console.log(`  Objects: ${model.logical.objects.size}`);
    console.log(`  Processes: ${model.logical.processes.size}`);

    // Relations by type
    const relByType = new Map<RelationType, number>();
    for (const rel of model.logical.relations.values()) {
      relByType.set(rel.relationType, (relByType.get(rel.relationType) ?? 0) + 1);
    }
    console.log(`  Relations: ${model.logical.relations.size}`);
    for (const [type, count] of relByType) {
      const label = RELATION_TYPE_LABELS[type] ?? `Unknown(${type})`;
      console.log(`    ${label}: ${count}`);
    }

    // Links by type
    const linkByType = new Map<LinkType, number>();
    for (const link of model.logical.links.values()) {
      linkByType.set(link.linkType, (linkByType.get(link.linkType) ?? 0) + 1);
    }
    console.log(`  Links: ${model.logical.links.size}`);
    for (const [type, count] of linkByType) {
      const label = LINK_TYPE_LABELS[type] ?? `Unknown(${type})`;
      console.log(`    ${label}: ${count}`);
    }

    // OPD hierarchy
    console.log(`  OPDs: ${model.visual.allOpds.size}`);
    printOpdTree(model.visual.rootOpd, 2);
    console.log();
  } catch (e) {
    console.error(`  ERROR parsing ${file}: ${e instanceof Error ? e.message : e}`);
    console.log();
  }
}
