import { MarketCard } from "./MarketCard";
import { MarketCardProps } from "@/lib/types";
import Container from "@/components/primitives/Container";

export function MarketList({ markets }: { markets: MarketCardProps[] }) {
  return (
    <Container>
      <div className="grid gap-4 py-6 md2:grid-cols-2 xl2:grid-cols-3">
        {markets.map((market) => (
          <MarketCard key={market.id} {...market} />
        ))}
      </div>
    </Container>
  );
}
