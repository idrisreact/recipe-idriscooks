import { create } from 'zustand';

interface MotionState {
  /**
   * True once the intro loader curtain has lifted (or was skipped),
   * so hero animations can start without racing it.
   */
  introDone: boolean;
  setIntroDone: (introDone: boolean) => void;
}

export const useMotionStore = create<MotionState>((set) => ({
  introDone: false,
  setIntroDone: (introDone) => set({ introDone }),
}));
