"use client";

import { useState } from "react";
import { useUI } from "@/lib/store";
import { createMarket } from "@/lib/ppmClient";
import { ERROR_MESSAGES } from "@/lib/contract";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";

export function CreateMarketModal() {
  const { createMarketOpen, closeCreateMarket, addToast, setPendingTx } = useUI();
  const [description, setDescription] = useState("");
  const [commitDuration, setCommitDuration] = useState("300"); // 5 min default
  const [revealDuration, setRevealDuration] = useState("300"); // 5 min default
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  if (!createMarketOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const commitSecs = parseInt(commitDuration);
    const revealSecs = parseInt(revealDuration);

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (commitSecs <= 0 || revealSecs <= 0) {
      setError(ERROR_MESSAGES.InvalidTimeParameters);
      return;
    }

    try {
      setPendingTx(true);
      await createMarket(description.trim(), commitSecs, revealSecs);
      addToast("Market created successfully!", "success");

      // Refetch markets
      queryClient.invalidateQueries({ queryKey: ["markets"] });

      closeCreateMarket();
      setDescription("");
      setCommitDuration("300");
      setRevealDuration("300");
    } catch (err) {
      console.error("Create market error:", err);

      const errorName = (err as Error)?.message?.match(/(\w+)\(/)?.[1];
      const message = errorName && ERROR_MESSAGES[errorName]
        ? ERROR_MESSAGES[errorName]
        : "Failed to create market. Please try again.";

      setError(message);
      addToast(message, "error");
    } finally {
      setPendingTx(false);
    }
  };

  const handleClose = () => {
    closeCreateMarket();
    setError("");
    setDescription("");
    setCommitDuration("300");
    setRevealDuration("300");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-bg1 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-txt1">Create Market</h2>
          <button
            onClick={handleClose}
            className="text-txt2 hover:text-txt1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-txt1">
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will happen?"
              required
            />
          </div>

          <div>
            <label htmlFor="commitDuration" className="mb-1 block text-sm font-medium text-txt1">
              Commit Window (seconds)
            </label>
            <Input
              id="commitDuration"
              type="number"
              min="1"
              value={commitDuration}
              onChange={(e) => setCommitDuration(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-txt2">
              Time allowed for users to commit votes (min: 1 second)
            </p>
          </div>

          <div>
            <label htmlFor="revealDuration" className="mb-1 block text-sm font-medium text-txt1">
              Reveal Window (seconds)
            </label>
            <Input
              id="revealDuration"
              type="number"
              min="1"
              value={revealDuration}
              onChange={(e) => setRevealDuration(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-txt2">
              Time allowed for users to reveal votes (min: 1 second)
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-white">
              Create Market
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
