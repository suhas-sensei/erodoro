"use client";

import { useUI } from "@/lib/store";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { trapFocus } from "@/lib/a11y";

const providers = [
  { name: "Apple", icon: "" },
  { name: "Facebook", icon: "" },
  { name: "Twitter", icon: "𝕏" },
  { name: "Discord", icon: "" },
  { name: "GitHub", icon: "" },
  { name: "Twitch", icon: "" },
];

export function LoginModal() {
  const { loginOpen, closeLogin } = useUI();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loginOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLogin();
    };

    document.addEventListener("keydown", handleEscape);
    const cleanup = modalRef.current ? trapFocus(modalRef.current) : undefined;

    return () => {
      document.removeEventListener("keydown", handleEscape);
      cleanup?.();
    };
  }, [loginOpen, closeLogin]);

  if (!loginOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
      onClick={closeLogin}
    >
      <div
        ref={modalRef}
        className="token-border-strong relative w-full max-w-[720px] rounded-modal border bg-bg2 p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeLogin}
          className="absolute right-4 top-4 rounded-control p-1 text-txt2 transition-colors hover:bg-bg3 hover:text-txt1"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="mb-6 text-center text-[24px] font-bold text-txt1">
          Welcome to erodoro
        </h2>

        {/* Google button */}
        <Button variant="primary" size="lg" className="mb-4 w-full">
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-bd0" />
          <span className="text-[13px] text-txt3">OR</span>
          <div className="h-px flex-1 bg-bd0" />
        </div>

        {/* Email input */}
        <div className="mb-4">
          <Input
            type="email"
            placeholder="Enter your email"
            className="w-full"
          />
          <Button variant="primary" size="lg" className="mt-2 w-full">
            Continue with Email
          </Button>
        </div>

        {/* Provider grid */}
        <div className="grid grid-cols-3 gap-3">
          {providers.map((provider) => (
            <button
              key={provider.name}
              className="token-border flex h-12 items-center justify-center gap-2 rounded-control border bg-bg3 text-[14px] font-medium text-txt1 transition-colors hover:bg-bg2"
            >
              {provider.icon && <span>{provider.icon}</span>}
              {provider.name}
            </button>
          ))}
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-[12px] text-txt3">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-blue hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
