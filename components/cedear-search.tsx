'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CEDEAR_LIST } from '@/lib/cedears';
import { Input } from '@/components/ui/input';

export function CedearSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CEDEAR_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.localTicker.toLowerCase().includes(q) ||
        c.ticker.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const handleSelect = useCallback(
    (ticker: string) => {
      setQuery('');
      setOpen(false);
      setActiveIndex(-1);
      router.push(`/cedear/${encodeURIComponent(ticker)}`);
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || filtered.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : filtered.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < filtered.length) {
            handleSelect(filtered[activeIndex].ticker);
          }
          break;
        case 'Escape':
          setOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [open, filtered, activeIndex, handleSelect]
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          placeholder="Buscar CEDEAR... (ej: AAPL, Tesla, Tecnologia)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="pl-9 h-11 text-base"
          role="combobox"
          aria-expanded={open && filtered.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
      </div>
      {open && filtered.length > 0 && (
        <div
          className="absolute z-50 top-full mt-1.5 w-full bg-popover border rounded-lg shadow-xl max-h-80 overflow-y-auto"
          role="listbox"
        >
          {filtered.map((c, i) => (
            <button
              key={c.ticker}
              role="option"
              aria-selected={i === activeIndex}
              className={`w-full px-3 py-2.5 text-left flex items-center justify-between text-sm transition-colors ${
                i === activeIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(c.ticker)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                  {c.localTicker}
                </span>
                <span className="text-foreground">{c.name}</span>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {c.sector}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
