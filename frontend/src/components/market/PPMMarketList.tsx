import { PPMMarketCard } from "./PPMMarketCard";
import Container from "@/components/primitives/Container";
import type { Market } from "@/lib/ppmClient";

export function PPMMarketList({ markets }: { markets: (Market & { id: number })[] }) {
  if (markets.length === 0) {
    return (
      <Container>
        <div className="py-12 text-center text-txt2">
          No markets yet. Create the first one!
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="grid gap-4 py-6 md2:grid-cols-2 xl2:grid-cols-3">
        {markets.map((market) => (
          <PPMMarketCard key={market.id} market={market} />
        ))}
      </div>
    </Container>
  );
}
