import { useCallback } from 'react';
import { useModelStore } from '../store/model-store';
import { Essence, Affiliation } from '../model/enums';

export function PropertyPanel() {
  const model = useModelStore((s) => s.model);
  const selectedEntityId = useModelStore((s) => s.selectedEntityId);
  const renameEntity = useModelStore((s) => s.renameEntity);
  const updateObjectProps = useModelStore((s) => s.updateObjectProps);
  const updateProcessProps = useModelStore((s) => s.updateProcessProps);
  const updateEntityDescription = useModelStore((s) => s.updateEntityDescription);
  const addState = useModelStore((s) => s.addState);
  const deleteEntity = useModelStore((s) => s.deleteEntity);

  if (!model || selectedEntityId === null) return null;

  const obj = model.logical.objects.get(selectedEntityId);
  const proc = model.logical.processes.get(selectedEntityId);
  const entity = obj ?? proc;

  if (!entity) return null;

  const isObject = !!obj;

  return (
    <div className="property-panel">
      <div className="property-panel-header">
        <h3>{isObject ? 'Object' : 'Process'} Properties</h3>
      </div>

      <div className="property-panel-body">
        {/* Name */}
        <label className="prop-label">Name</label>
        <input
          className="prop-input"
          value={entity.entity.name}
          onChange={(e) => renameEntity(selectedEntityId, e.target.value)}
        />

        {/* Essence */}
        <label className="prop-label">Essence</label>
        <select
          className="prop-input"
          value={entity.essence}
          onChange={(e) => {
            const val = e.target.value as Essence;
            if (isObject) updateObjectProps(selectedEntityId, { essence: val });
            else updateProcessProps(selectedEntityId, { essence: val });
          }}
        >
          <option value={Essence.Informatical}>Informatical</option>
          <option value={Essence.Physical}>Physical</option>
        </select>

        {/* Affiliation */}
        <label className="prop-label">Affiliation</label>
        <select
          className="prop-input"
          value={entity.affiliation}
          onChange={(e) => {
            const val = e.target.value as Affiliation;
            if (isObject) updateObjectProps(selectedEntityId, { affiliation: val });
            else updateProcessProps(selectedEntityId, { affiliation: val });
          }}
        >
          <option value={Affiliation.Systemic}>Systemic</option>
          <option value={Affiliation.Environmental}>Environmental</option>
        </select>

        {/* Description */}
        <label className="prop-label">Description</label>
        <textarea
          className="prop-input prop-textarea"
          value={entity.entity.description}
          onChange={(e) => updateEntityDescription(selectedEntityId, e.target.value)}
          rows={3}
        />

        {/* States (objects only) */}
        {isObject && obj && (
          <>
            <label className="prop-label">
              States ({obj.states.length})
              <button className="prop-add-btn" onClick={() => addState(selectedEntityId)}>
                +
              </button>
            </label>
            <div className="prop-states-list">
              {obj.states.map((s) => (
                <div key={s.entity.id} className="prop-state-item">
                  <input
                    className="prop-state-input"
                    value={s.entity.name}
                    onChange={(e) => renameEntity(s.entity.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delete */}
        <button
          className="prop-delete-btn"
          onClick={() => deleteEntity(selectedEntityId)}
        >
          Delete {isObject ? 'Object' : 'Process'}
        </button>
      </div>
    </div>
  );
}
