import { create } from 'zustand';
import type { OpmModel } from '../model/types';
import { parseOpxBuffer } from '../parser/opx-parser';

export interface ModelState {
  model: OpmModel | null;
  isLoading: boolean;
  error: string | null;

  loadFromBuffer: (buffer: ArrayBuffer) => void;
  clear: () => void;
}

export const useModelStore = create<ModelState>((set) => ({
  model: null,
  isLoading: false,
  error: null,

  loadFromBuffer: (buffer: ArrayBuffer) => {
    set({ isLoading: true, error: null });
    try {
      const model = parseOpxBuffer(buffer);
      set({ model, isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : String(e),
        isLoading: false,
      });
    }
  },

  clear: () => set({ model: null, error: null }),
}));
