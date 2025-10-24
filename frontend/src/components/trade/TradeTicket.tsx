"use client";

import { useState } from "react";
import { useUI } from "@/lib/store";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { X } from "lucide-react";

const quickAmounts = [10, 25, 50, 100];

export function TradeTicket() {
  const { trade, closeTrade } = useUI();
  const [tab, setTab] = useState<"Buy" | "Sell">("Buy");
  const [orderType, setOrderType] = useState<"Market" | "Limit">("Market");
  const [outcome, setOutcome] = useState<"yes" | "no" | null>(null);
  const [amount, setAmount] = useState(0);

  if (!trade) return null;

  const handleQuickAmount = (value: number) => {
    setAmount((prev) => prev + value);
  };

  const isValid = outcome !== null && amount > 0;

  return (
    <>
      {/* Desktop: Fixed right panel */}
      <div className="token-border fixed right-0 top-0 hidden h-screen w-[380px] border-l bg-bg2 p-6 lg:block">
        <TradeContent
          tab={tab}
          setTab={setTab}
          orderType={orderType}
          setOrderType={setOrderType}
          outcome={outcome}
          setOutcome={setOutcome}
          amount={amount}
          handleQuickAmount={handleQuickAmount}
          isValid={isValid}
          onClose={closeTrade}
        />
      </div>

      {/* Mobile: Bottom drawer */}
      <div className="token-border-strong fixed inset-x-0 bottom-0 z-50 rounded-t-modal border-t bg-bg2 p-6 lg:hidden">
        <TradeContent
          tab={tab}
          setTab={setTab}
          orderType={orderType}
          setOrderType={setOrderType}
          outcome={outcome}
          setOutcome={setOutcome}
          amount={amount}
          handleQuickAmount={handleQuickAmount}
          isValid={isValid}
          onClose={closeTrade}
        />
      </div>
    </>
  );
}

function TradeContent({
  tab,
  setTab,
  orderType,
  setOrderType,
  outcome,
  setOutcome,
  amount,
  handleQuickAmount,
  isValid,
  onClose,
}: {
  tab: "Buy" | "Sell";
  setTab: (tab: "Buy" | "Sell") => void;
  orderType: "Market" | "Limit";
  setOrderType: (type: "Market" | "Limit") => void;
  outcome: "yes" | "no" | null;
  setOutcome: (outcome: "yes" | "no") => void;
  amount: number;
  handleQuickAmount: (value: number) => void;
  isValid: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-txt1">Trade</h2>
        <button
          onClick={onClose}
          className="rounded-control p-1 text-txt2 transition-colors hover:bg-bg3 hover:text-txt1"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("Buy")}
          className={`flex-1 rounded-control py-2 text-[15px] font-semibold transition-colors ${
            tab === "Buy"
              ? "bg-blue text-white"
              : "bg-bg3 text-txt2 hover:text-txt1"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTab("Sell")}
          className={`flex-1 rounded-control py-2 text-[15px] font-semibold transition-colors ${
            tab === "Sell"
              ? "bg-blue text-white"
              : "bg-bg3 text-txt2 hover:text-txt1"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div className="mb-6">
        <label className="mb-2 block text-[13px] text-txt2">Order type</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as "Market" | "Limit")}
          className="h-11 w-full rounded-control border bg-field px-3 text-[15px] text-txt1 focus-visible:border-focus focus-visible:outline-none"
          style={{ borderColor: "var(--field-border)" }}
        >
          <option value="Market">Market</option>
          <option value="Limit">Limit</option>
        </select>
      </div>

      {/* Outcome toggles */}
      <div className="mb-6">
        <label className="mb-2 block text-[13px] text-txt2">Outcome</label>
        <div className="flex gap-2">
          <button
            onClick={() => setOutcome("yes")}
            className={`flex-1 rounded-control py-3 text-[16px] font-semibold transition-colors ${
              outcome === "yes"
                ? "bg-green text-white ring-2 ring-focus"
                : "token-border border bg-bg3 text-txt2 hover:text-txt1"
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setOutcome("no")}
            className={`flex-1 rounded-control py-3 text-[16px] font-semibold transition-colors ${
              outcome === "no"
                ? "bg-red text-white ring-2 ring-focus"
                : "token-border border bg-bg3 text-txt2 hover:text-txt1"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-6">
        <label className="mb-2 block text-[13px] text-txt2">Amount ($)</label>
        <div className="mb-2 flex gap-2">
          {quickAmounts.map((value) => (
            <Chip key={value} onClick={() => handleQuickAmount(value)}>
              +${value}
            </Chip>
          ))}
          <Chip onClick={() => handleQuickAmount(100)}>Max</Chip>
        </div>
        <div className="rounded-control border bg-field px-4 py-3 text-[44px] font-semibold leading-[48px] text-txt1">
          ${amount}
        </div>
      </div>

      {/* CTA */}
      <Button
        variant="primary"
        size="lg"
        disabled={!isValid}
        className="w-full"
      >
        {tab} {outcome === "yes" ? "Yes" : outcome === "no" ? "No" : ""}
      </Button>
    </div>
  );
}
