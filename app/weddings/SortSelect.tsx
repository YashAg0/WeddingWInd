"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SortSelectProps {
  activeSort: string;
}

export function SortSelect({ activeSort }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    
    if (val === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", val);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={activeSort}
        onChange={handleSortChange}
        className="text-xs font-semibold text-charcoal-700 bg-transparent outline-none cursor-pointer border border-warm-200/80 rounded-lg px-2.5 py-1.5 hover:border-warm-300 transition-colors"
      >
        <option value="featured">Featured First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
      </select>
    </div>
  );
}
