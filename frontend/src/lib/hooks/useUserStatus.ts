import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { hasCommitted, hasRevealed } from "../ppmClient";

export function useUserStatus(marketId: number) {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["userStatus", marketId, address],
    queryFn: async () => {
      if (!address) return { hasCommitted: false, hasRevealed: false };

      const [committed, revealed] = await Promise.all([
        hasCommitted(marketId, address),
        hasRevealed(marketId, address),
      ]);

      return { hasCommitted: committed, hasRevealed: revealed };
    },
    enabled: !!address && marketId !== undefined,
    refetchInterval: 5000,
  });
}
