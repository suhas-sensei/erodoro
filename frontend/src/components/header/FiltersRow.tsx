"use client";

import { Search, SlidersHorizontal, Bell, Bookmark } from "lucide-react";
import { Input } from "@/components/primitives/Input";
import { IconButton } from "@/components/primitives/IconButton";
import { Chip } from "@/components/primitives/Chip";
import Container from "@/components/primitives/Container";
import { useState } from "react";

const filterChips = [
  "Trending",
  "New",
  "Closing Soon",
  "High Volume",
  "Popular",
];

export function FiltersRow() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <div className="border-b border-bd0 bg-bg1">
      <Container>
        <div className="flex items-center gap-3 py-3">
          {/* Mobile search */}
          <div className="relative flex-1 md:hidden">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Search size={16} className="text-txt3" />
            </div>
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10"
            />
          </div>

          {/* Desktop search */}
          <div className="relative hidden md:block md:w-[280px]">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Search size={16} className="text-txt3" />
            </div>
            <Input
              type="search"
              placeholder="Filter markets..."
              className="w-full pl-10"
            />
          </div>

          {/* Filter button */}
          <IconButton aria-label="Open filters">
            <SlidersHorizontal size={16} />
          </IconButton>

          {/* Notification/Bookmark buttons */}
          <IconButton aria-label="Notifications">
            <Bell size={16} />
          </IconButton>
          <IconButton aria-label="Bookmarks">
            <Bookmark size={16} />
          </IconButton>

          {/* Chip filters - scrollable */}
          <div className="ml-auto flex gap-2 overflow-x-auto">
            {filterChips.map((chip) => (
              <Chip
                key={chip}
                active={activeFilter === chip}
                onClick={() =>
                  setActiveFilter(activeFilter === chip ? null : chip)
                }
              >
                {chip}
              </Chip>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
