"use client";

import { Header } from "@/components/header/Header";
import { PrimaryNav } from "@/components/header/PrimaryNav";
import { FiltersRow } from "@/components/header/FiltersRow";
import { PPMMarketList } from "@/components/market/PPMMarketList";
import { LoginModal } from "@/components/auth/LoginModal";
import { TradeTicket } from "@/components/trade/TradeTicket";
import { CreateMarketModal } from "@/components/market/CreateMarketModal";
import { CreatorPanel } from "@/components/market/CreatorPanel";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { useMarkets } from "@/lib/hooks/useMarkets";
import Container from "@/components/primitives/Container";

export default function Home() {
  const { data: markets, isLoading, error } = useMarkets();

  return (
    <div className="min-h-screen">
      <Header />
      <PrimaryNav />
      <FiltersRow />
      <main>
        {isLoading ? (
          <Container>
            <div className="flex justify-center py-12 text-txt2">
              Loading markets...
            </div>
          </Container>
        ) : error ? (
          <Container>
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="text-red-500">Error loading markets</div>
              <div className="text-sm text-txt2">
                {(error as Error).message || "Unknown error"}
              </div>
              <div className="text-xs text-txt3">Check console for details</div>
            </div>
          </Container>
        ) : (
          <PPMMarketList markets={markets || []} />
        )}
      </main>
      <LoginModal />
      <TradeTicket />
      <CreateMarketModal />
      <CreatorPanel />
      <ToastContainer />
    </div>
  );
}
