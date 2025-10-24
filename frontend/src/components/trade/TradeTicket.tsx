"use client";

import { useState, useEffect } from "react";
import { useUI } from "@/lib/store";
import { Button } from "@/components/primitives/Button";
import { X, Info } from "lucide-react";
import { useMarket } from "@/lib/hooks/useMarkets";
import { useAccount } from "wagmi";
import { commitVote, revealVote } from "@/lib/ppmClient";
import { generateSalt, saveCommitment, loadCommitment } from "@/lib/salt";
import { generateCommitmentHash } from "@/lib/ppmClient";
import { Vote, ERROR_MESSAGES } from "@/lib/contract";
import { useQueryClient } from "@tanstack/react-query";

export function TradeTicket() {
  const { trade, closeTrade } = useUI();

  if (!trade) return null;

  return (
    <>
      {/* Desktop: Fixed right panel */}
      <div className="token-border fixed right-0 top-0 hidden h-screen w-[420px] border-l bg-bg2 p-6 lg:block">
        <TradeContent />
      </div>

      {/* Mobile: Bottom drawer */}
      <div className="token-border-strong fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-modal border-t bg-bg2 p-6 lg:hidden">
        <TradeContent />
      </div>
    </>
  );
}

function TradeContent() {
  const { trade, closeTrade, addToast, setPendingTx } = useUI();
  const { address } = useAccount();
  const { data: market } = useMarket(trade?.marketId ?? 0);

  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [manualSalt, setManualSalt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const queryClient = useQueryClient();

  // Load stored commitment for reveal mode
  const storedCommitment =
    trade?.mode === "reveal" && address && trade?.marketId !== undefined
      ? loadCommitment(address, trade.marketId)
      : null;

  useEffect(() => {
    if (trade?.mode === "reveal" && storedCommitment) {
      setSelectedVote(storedCommitment.vote);
    }
  }, [trade?.mode, storedCommitment]);

  if (!trade || !market) return null;

  const isCommitMode = trade.mode === "commit";

  const handleCommit = async () => {
    if (!selectedVote || !address) {
      addToast("Please select YES or NO", "error");
      return;
    }

    try {
      setPendingTx(true);

      // Generate salt and commitment
      const salt = generateSalt();
      const commitment = generateCommitmentHash(selectedVote, salt);

      // Commit on-chain
      await commitVote(trade.marketId, commitment);

      // Save salt locally
      saveCommitment(address, trade.marketId, selectedVote, salt);

      addToast("Vote committed successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["userStatus", trade.marketId] });
      queryClient.invalidateQueries({ queryKey: ["market", trade.marketId] });

      closeTrade();
    } catch (err) {
      console.error("Commit error:", err);

      const errorName = (err as Error)?.message?.match(/(\w+)\(/)?.[1];
      const message =
        errorName && ERROR_MESSAGES[errorName]
          ? ERROR_MESSAGES[errorName]
          : "Failed to commit vote. Please try again.";

      addToast(message, "error");
    } finally {
      setPendingTx(false);
    }
  };

  const handleReveal = async () => {
    if (!address) {
      addToast("Please connect wallet", "error");
      return;
    }

    let salt: `0x${string}`;
    let vote: Vote;

    if (showAdvanced && manualSalt) {
      // Manual salt input
      if (!manualSalt.startsWith("0x") || manualSalt.length !== 66) {
        addToast("Invalid salt format. Must be 0x followed by 64 hex characters", "error");
        return;
      }
      salt = manualSalt as `0x${string}`;
      vote = selectedVote || Vote.Yes;
    } else {
      // Load from localStorage
      if (!storedCommitment) {
        addToast("No stored commitment found. Please use advanced mode to enter salt manually", "error");
        return;
      }
      salt = storedCommitment.salt;
      vote = storedCommitment.vote;
    }

    try {
      setPendingTx(true);

      await revealVote(trade.marketId, vote, salt);

      addToast(`Vote revealed: ${vote === Vote.Yes ? "YES" : "NO"}`, "success");
      queryClient.invalidateQueries({ queryKey: ["userStatus", trade.marketId] });
      queryClient.invalidateQueries({ queryKey: ["market", trade.marketId] });
      queryClient.invalidateQueries({ queryKey: ["voteCounts", trade.marketId] });
      queryClient.invalidateQueries({ queryKey: ["revealedVotes", trade.marketId] });

      closeTrade();
    } catch (err) {
      console.error("Reveal error:", err);

      const errorName = (err as Error)?.message?.match(/(\w+)\(/)?.[1];
      const message =
        errorName && ERROR_MESSAGES[errorName]
          ? ERROR_MESSAGES[errorName]
          : "Failed to reveal vote. Please try again.";

      addToast(message, "error");
    } finally {
      setPendingTx(false);
    }
  };

  const isValid = isCommitMode
    ? selectedVote !== null
    : showAdvanced
      ? manualSalt.length > 0 && selectedVote !== null
      : storedCommitment !== null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-txt1">
            {isCommitMode ? "Commit Vote" : "Reveal Vote"}
          </h2>
          <p className="text-sm text-txt2">Market #{trade.marketId}</p>
        </div>
        <button
          onClick={closeTrade}
          className="rounded-control p-1 text-txt2 transition-colors hover:bg-bg3 hover:text-txt1"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Market Description */}
      <div className="mb-6 rounded-lg bg-bg3 p-3">
        <p className="text-sm text-txt1">{market.description}</p>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex gap-2 rounded-lg bg-blue/10 p-3 text-sm text-txt1">
        <Info size={16} className="mt-0.5 flex-shrink-0" />
        <div>
          {isCommitMode ? (
            <p>
              Your vote will be encrypted and stored privately. You must reveal it during the reveal
              phase to be counted.
            </p>
          ) : (
            <p>
              Reveal your vote using the saved salt from your commit. Your vote will become public
              once revealed.
            </p>
          )}
        </div>
      </div>

      {/* Vote Selection */}
      {(isCommitMode || showAdvanced) && (
        <div className="mb-6">
          <label className="mb-2 block text-[13px] font-medium text-txt1">
            {isCommitMode ? "Select Your Vote" : "Your Vote"}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedVote(Vote.Yes)}
              disabled={!isCommitMode && !!storedCommitment}
              className={`flex-1 rounded-control py-4 text-[18px] font-semibold transition-colors ${
                selectedVote === Vote.Yes
                  ? "bg-green text-white ring-2 ring-focus"
                  : "token-border border bg-bg3 text-txt2 hover:text-txt1 disabled:opacity-50"
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setSelectedVote(Vote.No)}
              disabled={!isCommitMode && !!storedCommitment}
              className={`flex-1 rounded-control py-4 text-[18px] font-semibold transition-colors ${
                selectedVote === Vote.No
                  ? "bg-red text-white ring-2 ring-focus"
                  : "token-border border bg-bg3 text-txt2 hover:text-txt1 disabled:opacity-50"
              }`}
            >
              NO
            </button>
          </div>
        </div>
      )}

      {/* Reveal mode: show stored vote */}
      {!isCommitMode && !showAdvanced && storedCommitment && (
        <div className="mb-6 rounded-lg border border-border-subtle bg-bg1 p-4">
          <p className="mb-2 text-sm text-txt2">Your committed vote:</p>
          <div
            className={`inline-block rounded px-3 py-1 text-lg font-bold ${
              storedCommitment.vote === Vote.Yes
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {storedCommitment.vote === Vote.Yes ? "YES" : "NO"}
          </div>
        </div>
      )}

      {/* Advanced toggle for reveal */}
      {!isCommitMode && (
        <div className="mb-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {showAdvanced ? "Use saved salt" : "Enter salt manually (Advanced)"}
          </button>
        </div>
      )}

      {/* Manual salt input */}
      {!isCommitMode && showAdvanced && (
        <div className="mb-6">
          <label htmlFor="salt" className="mb-2 block text-[13px] font-medium text-txt1">
            Salt (32 bytes hex)
          </label>
          <input
            id="salt"
            type="text"
            value={manualSalt}
            onChange={(e) => setManualSalt(e.target.value)}
            placeholder="0x..."
            className="h-11 w-full rounded-control border bg-field px-3 font-mono text-sm text-txt1 focus-visible:border-focus focus-visible:outline-none"
            style={{ borderColor: "var(--field-border)" }}
          />
          <p className="mt-1 text-xs text-txt2">
            Enter the 66-character salt (0x + 64 hex chars) you used when committing
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        <Button
          onClick={isCommitMode ? handleCommit : handleReveal}
          disabled={!isValid}
          className="w-full bg-primary text-white disabled:opacity-50"
          size="lg"
        >
          {isCommitMode ? "Commit Vote" : "Reveal Vote"}
        </Button>
      </div>
    </div>
  );
}
