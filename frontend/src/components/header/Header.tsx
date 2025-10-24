"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/primitives/Input";
import { Button } from "@/components/primitives/Button";
import { useUI } from "@/lib/store";
import { forwardRef } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export const Header = forwardRef<HTMLElement>(function Header(props, ref) {
  const { openCreateMarket } = useUI();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  return (
    <header
      ref={ref}
      className="sticky top-0 z-50 h-[72px] border-b bg-bg1"
      style={{ borderColor: "var(--bd-0)" }}
    >
      <div className="mx-auto flex h-full max-w-[1320px] items-center gap-4 px-4 md:gap-6 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-[20px] font-bold text-txt1">
            erodoro
          </Link>
        </div>

        {/* Search - hidden on small screens, shown in FiltersRow */}
        <div className="relative hidden max-w-[640px] flex-1 md:block">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <Search size={16} className="text-txt3" />
          </div>
          <Input
            id="header-search"
            type="search"
            placeholder="Search markets..."
            className="w-full pl-10"
          />
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={openCreateMarket}>
            Create Market
          </Button>
          <a
            href="/help"
            className="hidden text-[14px] text-txt2 transition-colors hover:text-txt1 md:block"
          >
            Help
          </a>
          {isConnected ? (
            <>
              <span className="hidden text-[13px] text-txt2 md:block">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Button variant="ghost" size="sm" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={handleConnect}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
});
