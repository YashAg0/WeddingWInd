"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Calendar, Ticket, ShieldAlert, X, Command } from "lucide-react";
import { adminGlobalSearchAction } from "@/lib/actions/admin";

export default function AdminGlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd/Ctrl + K to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await adminGlobalSearchAction(query);
        setResults(res);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const hasResults =
    results &&
    (results.users?.length > 0 ||
      results.weddings?.length > 0 ||
      results.bookings?.length > 0 ||
      results.safetyCases?.length > 0);

  return (
    <>
      {/* Trigger Button in Admin Header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-warm-50 hover:bg-warm-100 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-600 transition-colors shadow-sm cursor-pointer"
      >
        <Search size={14} className="text-charcoal-400" />
        <span className="hidden sm:inline">Search platform...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-white border border-warm-200 px-1.5 py-0.5 rounded text-[0.625rem] font-bold text-charcoal-400">
          <Command size={10} />K
        </kbd>
      </button>

      {/* Global Search Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fade-in">
          <div className="bg-white border border-warm-200 rounded-3xl shadow-luxury w-full max-w-2xl overflow-hidden space-y-0">
            
            {/* Search Input Bar */}
            <div className="p-4 border-b border-warm-100 flex items-center gap-3 bg-warm-50/50">
              <Search size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search users, email, weddings, bookings, safety cases..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-sm font-semibold text-charcoal-900 bg-transparent border-none outline-none placeholder:text-charcoal-400 placeholder:font-normal"
              />
              {loading ? (
                <span className="text-xs text-charcoal-400 animate-pulse font-bold">Searching...</span>
              ) : (
                <button onClick={() => setOpen(false)} className="text-charcoal-400 hover:text-charcoal-700">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Results Area */}
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
              {!query || query.trim().length < 2 ? (
                <div className="py-8 text-center text-charcoal-400 font-medium">
                  Type at least 2 characters to search across users, weddings, bookings, and safety cases.
                </div>
              ) : !hasResults && !loading ? (
                <div className="py-8 text-center text-charcoal-500 font-semibold">
                  No matching record found for &quot;{query}&quot;.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Users Results */}
                  {results?.users?.length > 0 && (
                    <div>
                      <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block px-2 mb-1 flex items-center gap-1">
                        <User size={11} /> Users & Accounts
                      </span>
                      <div className="space-y-1">
                        {results.users.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelect(item.url)}
                            className="p-2.5 rounded-xl hover:bg-warm-100/70 transition-colors cursor-pointer flex justify-between items-center"
                          >
                            <span className="font-bold text-charcoal-900">{item.title}</span>
                            <span className="text-charcoal-500 text-[0.6875rem]">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weddings Results */}
                  {results?.weddings?.length > 0 && (
                    <div>
                      <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block px-2 mb-1 flex items-center gap-1">
                        <Calendar size={11} /> Weddings & Celebrations
                      </span>
                      <div className="space-y-1">
                        {results.weddings.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelect(item.url)}
                            className="p-2.5 rounded-xl hover:bg-warm-100/70 transition-colors cursor-pointer flex justify-between items-center"
                          >
                            <span className="font-bold text-charcoal-900">{item.title}</span>
                            <span className="text-charcoal-500 text-[0.6875rem]">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bookings Results */}
                  {results?.bookings?.length > 0 && (
                    <div>
                      <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block px-2 mb-1 flex items-center gap-1">
                        <Ticket size={11} /> Bookings
                      </span>
                      <div className="space-y-1">
                        {results.bookings.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelect(item.url)}
                            className="p-2.5 rounded-xl hover:bg-warm-100/70 transition-colors cursor-pointer flex justify-between items-center"
                          >
                            <span className="font-bold text-charcoal-900">{item.title}</span>
                            <span className="text-charcoal-500 text-[0.6875rem]">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Cases Results */}
                  {results?.safetyCases?.length > 0 && (
                    <div>
                      <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block px-2 mb-1 flex items-center gap-1">
                        <ShieldAlert size={11} /> Safety Ops Cases
                      </span>
                      <div className="space-y-1">
                        {results.safetyCases.map((item: any) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelect(item.url)}
                            className="p-2.5 rounded-xl hover:bg-warm-100/70 transition-colors cursor-pointer flex justify-between items-center"
                          >
                            <span className="font-bold text-charcoal-900">{item.title}</span>
                            <span className="text-charcoal-500 text-[0.6875rem]">{item.subtitle}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-warm-50 border-t border-warm-100 text-[0.625rem] text-charcoal-400 flex justify-between items-center">
              <span>Press <kbd className="bg-white px-1 border border-warm-200 rounded">ESC</kbd> to close</span>
              <span>Global Operations Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
