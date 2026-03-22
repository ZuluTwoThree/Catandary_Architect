/**
 * Extracts all entity IDs that appear in a given OPD diagram.
 * Used to filter OPL sentences to only those relevant to the active OPD.
 */

import type { OpdDiagram, OpdVisualThing } from '../model/types';

function collectThingIds(thing: OpdVisualThing, ids: Set<number>): void {
  ids.add(thing.entityId);
  for (const state of thing.visualStates) {
    ids.add(state.entityId);
  }
  for (const child of thing.children) {
    collectThingIds(child, ids);
  }
}

export function getOpdEntityIds(opd: OpdDiagram): Set<number> {
  const ids = new Set<number>();

  // Things (objects + processes)
  for (const thing of opd.things) {
    collectThingIds(thing, ids);
  }

  // Links
  for (const link of opd.links) {
    ids.add(link.entityId);
    ids.add(link.sourceId);
    ids.add(link.destinationId);
  }

  // Fundamental relations
  for (const group of opd.fundamentalRelations) {
    ids.add(group.sourceId);
    for (const rel of group.relations) {
      ids.add(rel.entityId);
      ids.add(rel.destinationId);
    }
  }

  // General relations
  for (const genRel of opd.generalRelations) {
    ids.add(genRel.entityId);
    ids.add(genRel.lineAttr.sourceId);
    ids.add(genRel.lineAttr.destinationId);
  }

  // Main entity (in-zoomed/unfolded)
  if (opd.mainEntity) {
    collectThingIds(opd.mainEntity, ids);
  }

  return ids;
}
