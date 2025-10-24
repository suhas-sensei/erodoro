import { create } from "zustand";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

type UIState = {
  loginOpen: boolean;
  openLogin(): void;
  closeLogin(): void;
  trade: null | { marketId: number; mode: "commit" | "reveal" };
  openTrade(marketId: number, mode: "commit" | "reveal"): void;
  closeTrade(): void;
  createMarketOpen: boolean;
  openCreateMarket(): void;
  closeCreateMarket(): void;
  creatorPanel: null | { marketId: number };
  openCreatorPanel(marketId: number): void;
  closeCreatorPanel(): void;
  toasts: Toast[];
  addToast(message: string, type: Toast["type"]): void;
  removeToast(id: string): void;
  pendingTx: boolean;
  setPendingTx(pending: boolean): void;
};

export const useUI = create<UIState>((set) => ({
  loginOpen: false,
  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),
  trade: null,
  openTrade: (marketId, mode) => set({ trade: { marketId, mode } }),
  closeTrade: () => set({ trade: null }),
  createMarketOpen: false,
  openCreateMarket: () => set({ createMarketOpen: true }),
  closeCreateMarket: () => set({ createMarketOpen: false }),
  creatorPanel: null,
  openCreatorPanel: (marketId) => set({ creatorPanel: { marketId } }),
  closeCreatorPanel: () => set({ creatorPanel: null }),
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  pendingTx: false,
  setPendingTx: (pending) => set({ pendingTx: pending }),
}));
