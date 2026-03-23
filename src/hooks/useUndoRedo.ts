import { useEffect } from 'react';
import { useModelStore } from '../store/model-store';

export function useUndoRedo() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useModelStore.temporal.getState().undo();
      }
      if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useModelStore.temporal.getState().redo();
      }
      if (e.key === 'y') {
        e.preventDefault();
        useModelStore.temporal.getState().redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
