"use client";

import { Header } from "@/components/header/Header";
import { PrimaryNav } from "@/components/header/PrimaryNav";
import { FiltersRow } from "@/components/header/FiltersRow";
import { MarketList } from "@/components/market/MarketList";
import { LoginModal } from "@/components/auth/LoginModal";
import { TradeTicket } from "@/components/trade/TradeTicket";
import { mockMarkets } from "@/lib/mock";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <PrimaryNav />
      <FiltersRow />
      <main>
        <MarketList markets={mockMarkets} />
      </main>
      <LoginModal />
      <TradeTicket />
    </div>
  );
}
