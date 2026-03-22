import type { OpmModel, OpmObject, OpmProcess, OpmLink, OpmRelation, OpdDiagram } from '../model/types';

/** Get an object by entity ID */
export function selectObject(model: OpmModel, id: number): OpmObject | undefined {
  return model.logical.objects.get(id);
}

/** Get a process by entity ID */
export function selectProcess(model: OpmModel, id: number): OpmProcess | undefined {
  return model.logical.processes.get(id);
}

/** Get a link by entity ID */
export function selectLink(model: OpmModel, id: number): OpmLink | undefined {
  return model.logical.links.get(id);
}

/** Get a relation by entity ID */
export function selectRelation(model: OpmModel, id: number): OpmRelation | undefined {
  return model.logical.relations.get(id);
}

/** Get all links where a given entity is source or destination */
export function selectLinksForEntity(model: OpmModel, entityId: number): OpmLink[] {
  const results: OpmLink[] = [];
  for (const link of model.logical.links.values()) {
    if (link.sourceId === entityId || link.destinationId === entityId) {
      results.push(link);
    }
  }
  return results;
}

/** Get all relations where a given entity is source or destination */
export function selectRelationsForEntity(model: OpmModel, entityId: number): OpmRelation[] {
  const results: OpmRelation[] = [];
  for (const rel of model.logical.relations.values()) {
    if (rel.sourceId === entityId || rel.destinationId === entityId) {
      results.push(rel);
    }
  }
  return results;
}

/** Get the OPD hierarchy as a flat list sorted by ID */
export function selectOpdList(model: OpmModel): OpdDiagram[] {
  return Array.from(model.visual.allOpds.values()).sort((a, b) => a.id - b.id);
}

/** Get an OPD by its ID */
export function selectOpd(model: OpmModel, opdId: number): OpdDiagram | undefined {
  return model.visual.allOpds.get(opdId);
}
