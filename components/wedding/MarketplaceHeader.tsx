"use client";

import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { MobileFilterDrawer } from "./MobileFilterDrawer";

export function MarketplaceHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <SearchBar onToggleMobileFilters={() => setIsDrawerOpen(true)} />
      <MobileFilterDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
