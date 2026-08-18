/**
 * src/store/modeStore.ts
 * Zustand store for Customer / Worker mode switching
 * 
 * RULE: Customer mode is ALWAYS the default.
 * Worker mode is only available after Admin verification (ACTIVE status).
 */
import { create } from 'zustand';

export type AppMode = 'customer' | 'worker';

interface ModeState {
  activeMode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

export const useModeStore = create<ModeState>((set, get) => ({
  activeMode: 'customer', // ALWAYS start as customer

  setMode: (mode) => set({ activeMode: mode }),

  toggleMode: () => {
    const current = get().activeMode;
    set({ activeMode: current === 'customer' ? 'worker' : 'customer' });
  },
}));
