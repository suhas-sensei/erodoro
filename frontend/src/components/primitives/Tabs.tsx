"use client";

import { useState } from "react";

export function Tabs({
  tabs,
  defaultTab,
  onChange,
}: {
  tabs: string[];
  defaultTab?: string;
  onChange?: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onChange?.(tab);
  };

  return (
    <div className="flex gap-6 border-b border-bd0">
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => handleTabClick(tab)}
          className={`relative pb-3 text-[15px] font-medium transition-colors duration-150 ${
            activeTab === tab ? "text-txt1" : "text-txt2 hover:text-txt1"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue" />
          )}
        </button>
      ))}
    </div>
  );
}
