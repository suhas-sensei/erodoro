"use client";

import { useState } from "react";
import { useUI } from "@/lib/store";
import { useMarket } from "@/lib/hooks/useMarkets";
import { useAccount } from "wagmi";
import {
  getVoteCounts,
  getRevealedVotes,
  transitionToReveal,
  transitionToResolved,
  resolveMarket,
} from "@/lib/ppmClient";
import { MarketState, Vote, ERROR_MESSAGES } from "@/lib/contract";
import { formatTimestamp } from "@/lib/time";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/primitives/Button";

export function CreatorPanel() {
  const { creatorPanel, closeCreatorPanel, addToast, setPendingTx } = useUI();
  const { address } = useAccount();
  const [selectedOutcome, setSelectedOutcome] = useState<boolean | null>(null);
  const queryClient = useQueryClient();

  const { data: market } = useMarket(creatorPanel?.marketId ?? 0);

  const { data: voteCounts } = useQuery({
    queryKey: ["voteCounts", creatorPanel?.marketId],
    queryFn: async () => {
      if (!creatorPanel) return null;
      try {
        return await getVoteCounts(creatorPanel.marketId);
      } catch (err) {
        if ((err as Error)?.message?.includes("OnlyCreator")) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!creatorPanel && !!market,
    refetchInterval: 5000,
  });

  const { data: revealedVotes } = useQuery({
    queryKey: ["revealedVotes", creatorPanel?.marketId],
    queryFn: async () => {
      if (!creatorPanel) return null;
      try {
        return await getRevealedVotes(creatorPanel.marketId);
      } catch (err) {
        if ((err as Error)?.message?.includes("OnlyCreator")) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!creatorPanel && !!market,
    refetchInterval: 5000,
  });

  if (!creatorPanel || !market) return null;

  const isCreator = address?.toLowerCase() === market.creator.toLowerCase();

  if (!isCreator) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-2xl rounded-lg bg-bg1 p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-txt1">Creator Panel</h2>
            <button
              onClick={closeCreatorPanel}
              className="text-txt2 hover:text-txt1"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-txt2">{ERROR_MESSAGES.OnlyCreator}</p>
        </div>
      </div>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const canTransitionToReveal =
    market.state === MarketState.Commit && now >= Number(market.commitEndTime);
  const canTransitionToResolved =
    market.state === MarketState.Reveal && now >= Number(market.revealEndTime);
  const canResolve = market.state === MarketState.Resolved && !market.isResolved;

  const handleTransitionToReveal = async () => {
    try {
      setPendingTx(true);
      await transitionToReveal(creatorPanel.marketId);
      addToast("Market transitioned to Reveal phase", "success");
      queryClient.invalidateQueries({ queryKey: ["market", creatorPanel.marketId] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    } catch (err) {
      const errorName = (err as Error)?.message?.match(/(\w+)\(/)?.[1];
      const message =
        errorName && ERROR_MESSAGES[errorName]
          ? ERROR_MESSAGES[errorName]
          : "Failed to transition. Please try again.";
      addToast(message, "error");
    } finally {
      setPendingTx(false);
    }
  };

  const handleTransitionToResolved = async () => {
    try {
      setPendingTx(true);
      await transitionToResolved(creatorPanel.marketId);
      addToast("Market transitioned to Resolved state", "success");
      queryClient.invalidateQueries({ queryKey: ["market", creatorPanel.marketId] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    } catch (err) {
      const errorName = (err as Error)?.message?.match(/(\w+)\(/)?.[1];
      const message =
        errorName && ERROR_MESSAGES[errorName]
          ? ERROR_MESSAGES[errorName]
          : "Failed to transition. Please try again.";
      addToast(message, "error");
    } finally {
      setPendingTx(false);
    }
  };

  const handleResolve = async () => {
    if (selectedOutcome === null) {
      addToast("Please select an outcome", "error");
      return;
    }

    try {
      setPendingTx(true);
      await resolveMarket(creatorPanel.marketId, selectedOutcome);
      addToast(`Market resolved: ${selectedOutcome ? "YES" : "NO"}`, "success");
      queryClient.invalidateQueries({ queryKey: ["market", creatorPanel.marketId] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      closeCreatorPanel();
    } catch (err) {
      const errorName = (err as Error)?.message?.match(/(\w+)\(/)?.[1];
      const message =
        errorName && ERROR_MESSAGES[errorName]
          ? ERROR_MESSAGES[errorName]
          : "Failed to resolve. Please try again.";
      addToast(message, "error");
    } finally {
      setPendingTx(false);
    }
  };

  const getVoteLabel = (vote: Vote) => {
    if (vote === Vote.Yes) return "YES";
    if (vote === Vote.No) return "NO";
    return "NONE";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-bg1 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-txt1">Creator Panel</h2>
          <button
            onClick={closeCreatorPanel}
            className="text-txt2 hover:text-txt1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-bg2 p-4">
          <h3 className="mb-2 font-semibold text-txt1">{market.description}</h3>
          <p className="text-sm text-txt2">Market #{creatorPanel.marketId}</p>
        </div>

        {/* Manual Transitions */}
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold text-txt1">Manual Transitions</h3>

          {canTransitionToReveal && (
            <Button onClick={handleTransitionToReveal} className="w-full">
              Move to Reveal Phase
            </Button>
          )}

          {canTransitionToResolved && (
            <Button onClick={handleTransitionToResolved} className="w-full">
              Move to Resolved State
            </Button>
          )}

          {!canTransitionToReveal && !canTransitionToResolved && (
            <p className="text-sm text-txt2">No manual transitions available at this time</p>
          )}
        </div>

        {/* Resolve Market */}
        {canResolve && (
          <div className="mb-6 rounded-lg border border-border-subtle bg-bg2 p-4">
            <h3 className="mb-3 font-semibold text-txt1">Resolve Market Outcome</h3>
            <div className="mb-3 flex gap-3">
              <button
                onClick={() => setSelectedOutcome(true)}
                className={`flex-1 rounded-lg border-2 px-4 py-3 font-semibold transition ${
                  selectedOutcome === true
                    ? "border-green-500 bg-green-100 text-green-800"
                    : "border-border-subtle bg-bg1 text-txt2 hover:border-txt2"
                }`}
              >
                YES
              </button>
              <button
                onClick={() => setSelectedOutcome(false)}
                className={`flex-1 rounded-lg border-2 px-4 py-3 font-semibold transition ${
                  selectedOutcome === false
                    ? "border-red-500 bg-red-100 text-red-800"
                    : "border-border-subtle bg-bg1 text-txt2 hover:border-txt2"
                }`}
              >
                NO
              </button>
            </div>
            <Button
              onClick={handleResolve}
              disabled={selectedOutcome === null}
              className="w-full bg-primary text-white disabled:opacity-50"
            >
              Resolve Market
            </Button>
          </div>
        )}

        {market.isResolved && (
          <div className="mb-6 rounded-lg bg-green-100 p-4 text-center">
            <p className="font-semibold text-green-800">
              Market Resolved: {market.outcome ? "YES" : "NO"}
            </p>
          </div>
        )}

        {/* Private Stats */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-txt1">Private Vote Counts</h3>
          {voteCounts ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-100 p-4 text-center">
                <p className="text-2xl font-bold text-green-800">
                  {voteCounts.yesVotes.toString()}
                </p>
                <p className="text-sm text-green-700">YES Votes</p>
              </div>
              <div className="rounded-lg bg-red-100 p-4 text-center">
                <p className="text-2xl font-bold text-red-800">
                  {voteCounts.noVotes.toString()}
                </p>
                <p className="text-sm text-red-700">NO Votes</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-txt2">Vote counts not available</p>
          )}
        </div>

        {/* Revealed Votes List */}
        <div>
          <h3 className="mb-3 font-semibold text-txt1">Revealed Votes</h3>
          {revealedVotes && revealedVotes.length > 0 ? (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border-subtle">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-bg2 text-left">
                  <tr>
                    <th className="p-2 font-medium text-txt1">Voter</th>
                    <th className="p-2 font-medium text-txt1">Vote</th>
                    <th className="p-2 font-medium text-txt1">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {revealedVotes.map((vote, i) => (
                    <tr key={i} className="border-t border-border-subtle">
                      <td className="p-2 font-mono text-xs text-txt2">
                        {vote.voter.slice(0, 6)}...{vote.voter.slice(-4)}
                      </td>
                      <td className="p-2">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            vote.vote === Vote.Yes
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getVoteLabel(vote.vote)}
                        </span>
                      </td>
                      <td className="p-2 text-txt2">{formatTimestamp(vote.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-txt2">No revealed votes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
