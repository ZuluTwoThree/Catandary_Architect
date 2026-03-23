import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import type {
  OpmModel,
  OpmObject,
  OpmProcess,
  OpmTime,
  OpdDiagram,
  OpdVisualThing,
  OpdVisualLink,
  OpdVisualState,
} from '../model/types';
import {
  Affiliation,
  ConnectionSide,
  Essence,
  LinkType,
  RelationType,
} from '../model/enums';
import { parseOpxBuffer } from '../parser/opx-parser';

// ─── Default Factories ────────────────────────────────────────────────

const ZERO_TIME: OpmTime = {
  hours: 0, minutes: 0, seconds: 0, centiseconds: 0,
  milliseconds: 0, microseconds: 0, nanoseconds: 0, isInfinity: false,
};

function defaultObject(id: number, name: string): OpmObject {
  return {
    entity: { id, name, description: '', url: '' },
    essence: Essence.Informatical,
    affiliation: Affiliation.Systemic,
    states: [],
    type: '', typeOriginId: 0, persistent: false, key: false,
    indexName: '', indexOrder: 0, initialValue: '',
    numberOfInstances: 1, role: '', scope: 0, locked: false,
  };
}

function defaultProcess(id: number, name: string): OpmProcess {
  return {
    entity: { id, name, description: '', url: '' },
    essence: Essence.Informatical,
    affiliation: Affiliation.Systemic,
    numberOfInstances: 1, role: '', scope: 0,
    processBody: '',
    minTimeActivation: ZERO_TIME,
    maxTimeActivation: { ...ZERO_TIME, isInfinity: true },
    locked: false,
  };
}

function defaultVisualThing(
  entityId: number,
  entityInOpdId: number,
  thingType: 'object' | 'process',
  x: number,
  y: number,
): OpdVisualThing {
  return {
    entityId,
    entityInOpdId,
    x, y,
    width: 120, height: 60,
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    textColor: '#000000',
    layer: 1,
    textPosition: 'C',
    statesAutoArranged: true,
    visualStates: [],
    children: [],
    thingType,
  };
}

function defaultVisualLink(
  entityId: number,
  entityInOpdId: number,
  sourceId: number,
  sourceInOpdId: number,
  destId: number,
  destInOpdId: number,
): OpdVisualLink {
  return {
    entityId,
    entityInOpdId,
    sourceId,
    sourceInOpdId,
    sourceConnectionSide: ConnectionSide.Bottom,
    sourceConnectionParameter: 0.5,
    destinationId: destId,
    destinationInOpdId: destInOpdId,
    destinationConnectionSide: ConnectionSide.Top,
    destinationConnectionParameter: 0.5,
    autoArranged: true,
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    textColor: '#000000',
  };
}

// ─── Helper: find visual thing in OPD (including mainEntity.children) ─

function findVisualThingInOpd(
  opd: OpdDiagram,
  entityId: number,
  entityInOpdId: number,
): OpdVisualThing | undefined {
  function search(things: OpdVisualThing[]): OpdVisualThing | undefined {
    for (const t of things) {
      if (t.entityId === entityId && t.entityInOpdId === entityInOpdId) return t;
      const found = search(t.children);
      if (found) return found;
    }
    return undefined;
  }
  let found = search(opd.things);
  if (!found && opd.mainEntity) {
    if (opd.mainEntity.entityId === entityId && opd.mainEntity.entityInOpdId === entityInOpdId) {
      return opd.mainEntity;
    }
    found = search(opd.mainEntity.children);
  }
  return found;
}

// ─── Helper: remove entity from all OPDs ──────────────────────────────

function removeEntityFromAllOpds(model: OpmModel, entityId: number): void {
  for (const opd of model.visual.allOpds.values()) {
    // Remove from things
    opd.things = opd.things.filter((t) => t.entityId !== entityId);
    // Remove from mainEntity children
    if (opd.mainEntity) {
      opd.mainEntity.children = opd.mainEntity.children.filter(
        (c) => c.entityId !== entityId,
      );
    }
    // Remove links referencing this entity
    opd.links = opd.links.filter(
      (l) => l.sourceId !== entityId && l.destinationId !== entityId,
    );
    // Remove from fundamental relation groups
    for (const group of opd.fundamentalRelations) {
      group.relations = group.relations.filter(
        (r) => r.destinationId !== entityId,
      );
    }
    opd.fundamentalRelations = opd.fundamentalRelations.filter(
      (g) => g.sourceId !== entityId && g.relations.length > 0,
    );
    // Remove general relations
    opd.generalRelations = opd.generalRelations.filter(
      (gr) =>
        gr.lineAttr.sourceId !== entityId &&
        gr.lineAttr.destinationId !== entityId,
    );
  }
}

// ─── Helper: find entityInOpdId for a given entity in an OPD ──────────

function findEntityInOpdId(opd: OpdDiagram, entityId: number): number | undefined {
  for (const t of opd.things) {
    if (t.entityId === entityId) return t.entityInOpdId;
  }
  if (opd.mainEntity) {
    for (const c of opd.mainEntity.children) {
      if (c.entityId === entityId) return c.entityInOpdId;
    }
  }
  return undefined;
}

// ─── Store Interface ──────────────────────────────────────────────────

export interface ModelState {
  model: OpmModel | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  selectedEntityId: number | null;
  activeOpdId: number | null;

  // File operations
  loadFromBuffer: (buffer: ArrayBuffer) => void;
  clear: () => void;

  // Navigation
  setActiveOpdId: (id: number | null) => void;
  setSelectedEntityId: (id: number | null) => void;

  // Entity CRUD
  addObject: (opdId: number, x: number, y: number) => number;
  addProcess: (opdId: number, x: number, y: number) => number;
  addState: (objectId: number) => number;
  deleteEntity: (entityId: number) => void;
  renameEntity: (entityId: number, name: string) => void;

  // Connection CRUD
  addLink: (
    linkType: LinkType,
    sourceId: number,
    destId: number,
    opdId: number,
  ) => number;
  deleteConnection: (entityId: number) => void;

  // Property editing
  updateObjectProps: (
    id: number,
    patch: Partial<Pick<OpmObject, 'essence' | 'affiliation' | 'persistent' | 'key'>>,
  ) => void;
  updateProcessProps: (
    id: number,
    patch: Partial<Pick<OpmProcess, 'essence' | 'affiliation' | 'processBody'>>,
  ) => void;
  updateEntityDescription: (entityId: number, description: string) => void;

  // Visual editing
  updateNodePosition: (
    opdId: number,
    entityId: number,
    entityInOpdId: number,
    x: number,
    y: number,
  ) => void;
  updateNodeSize: (
    opdId: number,
    entityId: number,
    entityInOpdId: number,
    width: number,
    height: number,
  ) => void;
}

// ─── Store Creation ───────────────────────────────────────────────────

export const useModelStore = create<ModelState>()(
  temporal(
    immer((set, get) => ({
      model: null,
      isLoading: false,
      error: null,
      isDirty: false,
      selectedEntityId: null,
      activeOpdId: null,

      // ── File Operations ──────────────────────────────────────────

      loadFromBuffer: (buffer: ArrayBuffer) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        try {
          const model = parseOpxBuffer(buffer);
          set((state) => {
            state.model = model;
            state.isLoading = false;
            state.isDirty = false;
            state.activeOpdId = null;
            state.selectedEntityId = null;
          });
        } catch (e) {
          set((state) => {
            state.error = e instanceof Error ? e.message : String(e);
            state.isLoading = false;
          });
        }
      },

      clear: () =>
        set((state) => {
          state.model = null;
          state.error = null;
          state.isDirty = false;
          state.activeOpdId = null;
          state.selectedEntityId = null;
        }),

      // ── Navigation ───────────────────────────────────────────────

      setActiveOpdId: (id) =>
        set((state) => {
          state.activeOpdId = id;
        }),

      setSelectedEntityId: (id) =>
        set((state) => {
          state.selectedEntityId = id;
        }),

      // ── Entity CRUD ──────────────────────────────────────────────

      addObject: (opdId, x, y) => {
        const { model } = get();
        if (!model) return -1;

        let newId = -1;
        set((state) => {
          const m = state.model!;
          m.maxEntityEntry += 1;
          newId = m.maxEntityEntry;

          // Logical
          m.logical.objects.set(newId, defaultObject(newId, 'New Object'));

          // Visual
          const opd = m.visual.allOpds.get(opdId);
          if (opd) {
            opd.maxEntityEntry += 1;
            const inOpdId = opd.maxEntityEntry;
            opd.things.push(defaultVisualThing(newId, inOpdId, 'object', x, y));
          }

          m.isDirty = true;
          state.isDirty = true;
        });
        return newId;
      },

      addProcess: (opdId, x, y) => {
        const { model } = get();
        if (!model) return -1;

        let newId = -1;
        set((state) => {
          const m = state.model!;
          m.maxEntityEntry += 1;
          newId = m.maxEntityEntry;

          m.logical.processes.set(newId, defaultProcess(newId, 'New Process'));

          const opd = m.visual.allOpds.get(opdId);
          if (opd) {
            opd.maxEntityEntry += 1;
            const inOpdId = opd.maxEntityEntry;
            opd.things.push(defaultVisualThing(newId, inOpdId, 'process', x, y));
          }

          state.isDirty = true;
        });
        return newId;
      },

      addState: (objectId) => {
        const { model } = get();
        if (!model) return -1;

        let newId = -1;
        set((state) => {
          const m = state.model!;
          const obj = m.logical.objects.get(objectId);
          if (!obj) return;

          m.maxEntityEntry += 1;
          newId = m.maxEntityEntry;

          // Add logical state
          obj.states.push({
            entity: { id: newId, name: 'new state', description: '', url: '' },
            isInitial: false,
            isFinal: false,
            isDefault: false,
            minTime: ZERO_TIME,
            maxTime: { ...ZERO_TIME, isInfinity: true },
            locked: false,
          });

          // Add visual state to each OPD showing this object
          for (const opd of m.visual.allOpds.values()) {
            const addVisualState = (things: OpdVisualThing[]) => {
              for (const t of things) {
                if (t.entityId === objectId && t.thingType === 'object') {
                  opd.maxEntityEntry += 1;
                  const vs: OpdVisualState = {
                    entityId: newId,
                    entityInOpdId: opd.maxEntityEntry,
                    x: t.x + 10,
                    y: t.y + t.height - 25,
                    width: t.width - 20,
                    height: 20,
                    backgroundColor: '#ffffff',
                    borderColor: '#000000',
                    textColor: '#000000',
                    visible: true,
                  };
                  t.visualStates.push(vs);
                }
                addVisualState(t.children);
              }
            };
            addVisualState(opd.things);
            if (opd.mainEntity) {
              addVisualState(opd.mainEntity.children);
            }
          }

          state.isDirty = true;
        });
        return newId;
      },

      deleteEntity: (entityId) =>
        set((state) => {
          const m = state.model;
          if (!m) return;

          // Remove from logical model
          m.logical.objects.delete(entityId);
          m.logical.processes.delete(entityId);

          // Remove all connections referencing this entity
          for (const [id, link] of m.logical.links) {
            if (link.sourceId === entityId || link.destinationId === entityId) {
              m.logical.links.delete(id);
            }
          }
          for (const [id, rel] of m.logical.relations) {
            if (rel.sourceId === entityId || rel.destinationId === entityId) {
              m.logical.relations.delete(id);
            }
          }

          // Remove from all OPDs
          removeEntityFromAllOpds(m, entityId);

          state.isDirty = true;
          if (state.selectedEntityId === entityId) {
            state.selectedEntityId = null;
          }
        }),

      renameEntity: (entityId, name) =>
        set((state) => {
          const m = state.model;
          if (!m) return;

          const obj = m.logical.objects.get(entityId);
          if (obj) { obj.entity.name = name; state.isDirty = true; return; }

          const proc = m.logical.processes.get(entityId);
          if (proc) { proc.entity.name = name; state.isDirty = true; return; }

          // Search states
          for (const o of m.logical.objects.values()) {
            const st = o.states.find((s) => s.entity.id === entityId);
            if (st) { st.entity.name = name; state.isDirty = true; return; }
          }
        }),

      // ── Connection CRUD ──────────────────────────────────────────

      addLink: (linkType, sourceId, destId, opdId) => {
        const { model } = get();
        if (!model) return -1;

        let newId = -1;
        set((state) => {
          const m = state.model!;
          m.maxEntityEntry += 1;
          newId = m.maxEntityEntry;

          // Logical link
          m.logical.links.set(newId, {
            entity: { id: newId, name: '', description: '', url: '' },
            linkType,
            sourceId,
            destinationId: destId,
            condition: '',
            path: '',
            minReactionTime: ZERO_TIME,
            maxReactionTime: { ...ZERO_TIME, isInfinity: true },
            locked: false,
          });

          // Visual link in the active OPD
          const opd = m.visual.allOpds.get(opdId);
          if (opd) {
            opd.maxEntityEntry += 1;
            const linkInOpdId = opd.maxEntityEntry;
            const srcInOpdId = findEntityInOpdId(opd, sourceId) ?? 0;
            const dstInOpdId = findEntityInOpdId(opd, destId) ?? 0;
            opd.links.push(
              defaultVisualLink(newId, linkInOpdId, sourceId, srcInOpdId, destId, dstInOpdId),
            );
          }

          state.isDirty = true;
        });
        return newId;
      },

      deleteConnection: (entityId) =>
        set((state) => {
          const m = state.model;
          if (!m) return;

          m.logical.links.delete(entityId);
          m.logical.relations.delete(entityId);

          // Remove from all OPDs
          for (const opd of m.visual.allOpds.values()) {
            opd.links = opd.links.filter((l) => l.entityId !== entityId);
            for (const group of opd.fundamentalRelations) {
              group.relations = group.relations.filter((r) => r.entityId !== entityId);
            }
            opd.fundamentalRelations = opd.fundamentalRelations.filter(
              (g) => g.relations.length > 0,
            );
            opd.generalRelations = opd.generalRelations.filter(
              (gr) => gr.entityId !== entityId,
            );
          }

          state.isDirty = true;
        }),

      // ── Property Editing ─────────────────────────────────────────

      updateObjectProps: (id, patch) =>
        set((state) => {
          const obj = state.model?.logical.objects.get(id);
          if (!obj) return;
          Object.assign(obj, patch);
          state.isDirty = true;
        }),

      updateProcessProps: (id, patch) =>
        set((state) => {
          const proc = state.model?.logical.processes.get(id);
          if (!proc) return;
          Object.assign(proc, patch);
          state.isDirty = true;
        }),

      updateEntityDescription: (entityId, description) =>
        set((state) => {
          const m = state.model;
          if (!m) return;

          const obj = m.logical.objects.get(entityId);
          if (obj) { obj.entity.description = description; state.isDirty = true; return; }

          const proc = m.logical.processes.get(entityId);
          if (proc) { proc.entity.description = description; state.isDirty = true; return; }
        }),

      // ── Visual Editing ───────────────────────────────────────────

      updateNodePosition: (opdId, entityId, entityInOpdId, x, y) =>
        set((state) => {
          const opd = state.model?.visual.allOpds.get(opdId);
          if (!opd) return;

          const thing = findVisualThingInOpd(opd, entityId, entityInOpdId);
          if (thing) {
            thing.x = x;
            thing.y = y;
            state.isDirty = true;
          }
        }),

      updateNodeSize: (opdId, entityId, entityInOpdId, width, height) =>
        set((state) => {
          const opd = state.model?.visual.allOpds.get(opdId);
          if (!opd) return;

          const thing = findVisualThingInOpd(opd, entityId, entityInOpdId);
          if (thing) {
            thing.width = Math.round(width);
            thing.height = Math.round(height);
            state.isDirty = true;
          }
        }),
    })),
    {
      limit: 50,
      // Exclude transient state from undo history
      partialize: (state) => ({
        model: state.model,
        isDirty: state.isDirty,
      }),
    },
  ),
);
