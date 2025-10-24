import { useQuery } from "@tanstack/react-query";
import { getMarketCount, getMarket, type Market } from "../ppmClient";

export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: async () => {
      try {
        const count = await getMarketCount();
        console.log("Market count:", count);
        const markets: (Market & { id: number })[] = [];

        for (let i = 0; i < Number(count); i++) {
          const market = await getMarket(i);
          console.log("Fetched market", i, market);
          markets.push({ ...market, id: i });
        }

        return markets;
      } catch (error) {
        console.error("Error fetching markets:", error);
        throw error;
      }
    },
    refetchInterval: 10000, // Poll every 10s
    retry: 3,
  });
}

export function useMarket(marketId: number) {
  return useQuery({
    queryKey: ["market", marketId],
    queryFn: () => getMarket(marketId),
    refetchInterval: 5000, // Poll every 5s
    enabled: marketId !== undefined,
  });
}
