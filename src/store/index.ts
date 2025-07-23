import { create } from "zustand";

interface BasketState {
  basket: any[];
  addToBasket: (item: any) => void;
}

export const useBasketStore = create<BasketState>((set) => ({
  basket: [],
  addToBasket: (item) => set((state) => ({ basket: [...state.basket, item] })),
}));