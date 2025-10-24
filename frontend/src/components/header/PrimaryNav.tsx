"use client";

import { useState } from "react";
import Container from "@/components/primitives/Container";

const navItems = [
  "All",
  "Politics",
  "Sports",
  "Tech",
  "Entertainment",
  "Crypto",
];

export function PrimaryNav() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <nav className="border-b border-bd0 bg-bg1">
      <Container>
        <div className="flex gap-6 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={activeTab === item}
              onClick={() => setActiveTab(item)}
              className={`relative whitespace-nowrap pb-3 pt-4 text-[15px] font-medium transition-colors duration-150 ${
                activeTab === item ? "text-txt1" : "text-txt2 hover:text-txt1"
              }`}
            >
              {item}
              {activeTab === item && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue" />
              )}
            </button>
          ))}
        </div>
      </Container>
    </nav>
  );
}
