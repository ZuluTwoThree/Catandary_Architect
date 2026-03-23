import { useCallback, useEffect, useRef } from 'react';
import { useModelStore } from '../store/model-store';
import { useReactFlow } from '@xyflow/react';

export interface ContextMenuState {
  x: number;
  y: number;
  opdId: number;
  entityId?: number;
  nodeType?: 'opmObject' | 'opmProcess';
  edgeEntityId?: number;
}

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
}

export function ContextMenu({ state, onClose }: ContextMenuProps) {
  const addObject = useModelStore((s) => s.addObject);
  const addProcess = useModelStore((s) => s.addProcess);
  const addState = useModelStore((s) => s.addState);
  const deleteEntity = useModelStore((s) => s.deleteEntity);
  const deleteConnection = useModelStore((s) => s.deleteConnection);

  const ref = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAddObject = useCallback(() => {
    const pos = screenToFlowPosition({ x: state.x, y: state.y });
    addObject(state.opdId, pos.x, pos.y);
    onClose();
  }, [addObject, state.opdId, state.x, state.y, screenToFlowPosition, onClose]);

  const handleAddProcess = useCallback(() => {
    const pos = screenToFlowPosition({ x: state.x, y: state.y });
    addProcess(state.opdId, pos.x, pos.y);
    onClose();
  }, [addProcess, state.opdId, state.x, state.y, screenToFlowPosition, onClose]);

  const handleAddState = useCallback(() => {
    if (state.entityId) addState(state.entityId);
    onClose();
  }, [addState, state.entityId, onClose]);

  const handleDeleteEntity = useCallback(() => {
    if (state.entityId) deleteEntity(state.entityId);
    onClose();
  }, [deleteEntity, state.entityId, onClose]);

  const handleDeleteEdge = useCallback(() => {
    if (state.edgeEntityId != null) deleteConnection(state.edgeEntityId);
    onClose();
  }, [deleteConnection, state.edgeEntityId, onClose]);

  // Node context menu
  if (state.entityId != null) {
    return (
      <div ref={ref} className="context-menu" style={{ left: state.x, top: state.y }}>
        {state.nodeType === 'opmObject' && (
          <button className="context-menu-item" onClick={handleAddState}>
            Add State
          </button>
        )}
        <button className="context-menu-item context-menu-danger" onClick={handleDeleteEntity}>
          Delete
        </button>
      </div>
    );
  }

  // Edge context menu
  if (state.edgeEntityId != null) {
    return (
      <div ref={ref} className="context-menu" style={{ left: state.x, top: state.y }}>
        <button className="context-menu-item context-menu-danger" onClick={handleDeleteEdge}>
          Delete Connection
        </button>
      </div>
    );
  }

  // Canvas context menu
  return (
    <div ref={ref} className="context-menu" style={{ left: state.x, top: state.y }}>
      <button className="context-menu-item" onClick={handleAddObject}>
        Add Object
      </button>
      <button className="context-menu-item" onClick={handleAddProcess}>
        Add Process
      </button>
    </div>
  );
}
