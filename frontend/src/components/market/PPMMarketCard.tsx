"use client";

import { Card } from "@/components/primitives/Card";
import { PricePill } from "./PricePill";
import { Clock } from "lucide-react";
import { MarketState } from "@/lib/contract";
import { formatTimeRemaining } from "@/lib/time";
import { useUI } from "@/lib/store";
import { useUserStatus } from "@/lib/hooks/useUserStatus";
import { useAccount } from "wagmi";
import type { Market } from "@/lib/ppmClient";

interface PPMMarketCardProps {
  market: Market & { id: number };
}

export function PPMMarketCard({ market }: PPMMarketCardProps) {
  const { openTrade, openCreatorPanel } = useUI();
  const { address } = useAccount();
  const { data: userStatus } = useUserStatus(market.id);

  const isCreator = address?.toLowerCase() === market.creator.toLowerCase();
  const now = Math.floor(Date.now() / 1000);

  const getPhaseInfo = () => {
    if (market.state === MarketState.Commit) {
      const timeLeft = formatTimeRemaining(market.commitEndTime);
      return {
        label: "Commit Phase",
        color: "blue" as const,
        timeLeft,
      };
    } else if (market.state === MarketState.Reveal) {
      const timeLeft = formatTimeRemaining(market.revealEndTime);
      return {
        label: "Reveal Phase",
        color: "orange" as const,
        timeLeft,
      };
    } else {
      return {
        label: market.isResolved
          ? `Resolved: ${market.outcome ? "YES" : "NO"}`
          : "Resolved (awaiting outcome)",
        color: "green" as const,
        timeLeft: null,
      };
    }
  };

  const phaseInfo = getPhaseInfo();

  const canCommit =
    market.state === MarketState.Commit &&
    now < Number(market.commitEndTime) &&
    !userStatus?.hasCommitted;

  const canReveal =
    market.state === MarketState.Reveal &&
    now < Number(market.revealEndTime) &&
    userStatus?.hasCommitted &&
    !userStatus?.hasRevealed;

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="mb-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[16px] font-semibold leading-[22px] text-txt1">
            {market.description}
          </h3>
          <span
            className={`inline-flex rounded-chip px-2 py-1 text-xs font-medium ${
              phaseInfo.color === "blue"
                ? "bg-blue-100 text-blue-800"
                : phaseInfo.color === "orange"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-green-100 text-green-800"
            }`}
          >
            {phaseInfo.label}
          </span>
        </div>
        {phaseInfo.timeLeft && (
          <div className="flex items-center gap-1 text-[13px] text-txt2">
            <Clock size={12} />
            <span>{phaseInfo.timeLeft} remaining</span>
          </div>
        )}
      </div>

      {/* Actions area */}
      <div className="mb-3 flex flex-col gap-2">
        {market.state === MarketState.Commit && (
          <div className="flex gap-2">
            <PricePill
              kind="yes"
              label="Commit YES"
              enabled={canCommit}
              onClick={() => canCommit && openTrade(market.id, "commit")}
            />
            <PricePill
              kind="no"
              label="Commit NO"
              enabled={canCommit}
              onClick={() => canCommit && openTrade(market.id, "commit")}
            />
          </div>
        )}

        {market.state === MarketState.Reveal && (
          <div className="flex gap-2">
            {canReveal ? (
              <button
                onClick={() => openTrade(market.id, "reveal")}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Reveal Vote
              </button>
            ) : userStatus?.hasRevealed ? (
              <div className="flex-1 rounded-lg border border-border-subtle bg-bg2 px-4 py-2 text-center text-sm text-txt2">
                Already Revealed
              </div>
            ) : userStatus?.hasCommitted === false ? (
              <div className="flex-1 rounded-lg border border-border-subtle bg-bg2 px-4 py-2 text-center text-sm text-txt2">
                Did Not Commit
              </div>
            ) : (
              <div className="flex-1 rounded-lg border border-border-subtle bg-bg2 px-4 py-2 text-center text-sm text-txt2">
                Committed
              </div>
            )}
          </div>
        )}

        {market.state === MarketState.Resolved && market.isResolved && (
          <div
            className={`rounded-lg px-4 py-2 text-center font-semibold ${
              market.outcome
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            Outcome: {market.outcome ? "YES" : "NO"}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border-subtle pt-3">
        <div className="text-[13px] text-txt2">
          {userStatus?.hasCommitted && (
            <span className="mr-3">
              {userStatus.hasRevealed ? "✓ Revealed" : "✓ Committed"}
            </span>
          )}
          Market #{market.id}
        </div>
        {isCreator && (
          <button
            onClick={() => openCreatorPanel(market.id)}
            className="text-[13px] font-medium text-primary hover:underline"
          >
            Creator Panel
          </button>
        )}
      </div>
    </Card>
  );
}
