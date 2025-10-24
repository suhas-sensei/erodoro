import { create } from "zustand";

type UIState = {
  loginOpen: boolean;
  openLogin(): void;
  closeLogin(): void;
  trade: null | { marketId: string };
  openTrade(marketId: string): void;
  closeTrade(): void;
};

export const useUI = create<UIState>((set) => ({
  loginOpen: false,
  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),
  trade: null,
  openTrade: (marketId) => set({ trade: { marketId } }),
  closeTrade: () => set({ trade: null }),
}));
