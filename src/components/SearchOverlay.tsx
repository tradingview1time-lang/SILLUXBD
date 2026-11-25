import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Search, X, BarChart3, ShoppingBag, Heart } from 'lucide-react';
import {
  PERFUME_SIZES,
  PERFUMES,
  Perfume,
  PerfumeSizeId,
  formatBdt,
  getPriceForSize,
  getStockLabel,
  isSizeOutOfStock,
  sortBestSellersFirst,
} from '../data/perfumes';

interface SearchOverlayProps {
  open: boolean;
  wishlistIds: Set<string>;
  onToggleWishlist: (perfume: Perfume, sizeId: PerfumeSizeId) => void;
  onClose: () => void;
  onViewNotes: (perfume: Perfume, sizeId: PerfumeSizeId) => void;
  onShopNow: (perfume: Perfume, sizeId: PerfumeSizeId) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  open,
  wishlistIds,
  onToggleWishlist,
  onClose,
  onViewNotes,
  onShopNow,
}) => {
  const [query, setQuery] = useState('');
  const [quickSize, setQuickSize] = useState<PerfumeSizeId>('10ML');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? PERFUMES
      : PERFUMES.filter((p) => {
          const hay = [
            p.name,
            p.house,
            p.family,
            p.concentration,
            p.tagline,
            ...p.notes.top,
            ...p.notes.heart,
            ...p.notes.base,
          ]
            .join(' ')
            .toLowerCase();
          return hay.includes(q);
        });
    return sortBestSellersFirst(filtered);
  }, [query]);

  if (!open) return null;

  const suggestedQueries = ['Oud', 'Saffron', 'Neroli', 'Vetiver', 'Leather', 'Extrait'];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1A1612]/48 backdrop-blur-[2px] flex items-start justify-center pt-6 sm:pt-20 px-3 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search Sillux fragrance vault"
    >
      <div className="w-full max-w-3xl bg-white border border-[#DECFA9] shadow-[0_30px_80px_-24px_rgba(26,22,18,0.35)] overflow-hidden flex flex-col max-h-[86dvh]">
        {/* Search Input Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#E7DCC4] bg-white shrink-0">
          <Search className="w-4 h-4 text-[#9A7228] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fragrance, house, or note (Oud, Saffron)..."
            className="flex-1 min-w-0 bg-transparent text-base text-[#1A1612] placeholder:text-[#8C8070] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-[#5C5347] hover:text-[#1A1612] cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#FAF6ED] border border-[#DFD1B4] text-[#5C5347] hover:text-[#1A1612] hover:border-[#B58938] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Note Filters + Preview Size Selector */}
        <div className="px-4 sm:px-5 py-3 bg-[#F7F2E8] border-b border-[#E7DCC4] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#6D6254]">Notes:</span>
            {suggestedQueries.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="text-[#5C5347] hover:text-[#8C641E] underline-offset-4 hover:underline transition-colors cursor-pointer py-1"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="flex items-center flex-wrap gap-1">
            {PERFUME_SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setQuickSize(s.id)}
                className={`min-h-[34px] px-2 py-1 text-[11px] font-mono tabular-nums border cursor-pointer transition-colors ${
                  quickSize === s.id
                    ? 'bg-[#D6B265] text-[#1A1612] border-[#B58938] font-semibold'
                    : 'bg-white text-[#5C5347] border-[#DFD1B4] hover:text-[#1A1612] hover:border-[#B58938]'
                }`}
              >
                {s.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto overscroll-contain divide-y divide-[#ECE2CE] bg-[#FCFBF8]">
          {results.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-display text-2xl text-[#1A1612]">No matching scents found</p>
              <p className="text-xs text-[#5C5347] mt-1.5">
                Try another olfactory note or contact our WhatsApp concierge at 01954987111.
              </p>
            </div>
          ) : (
            results.map((perfume) => {
              const price = getPriceForSize(perfume, quickSize);
              const isSaved = wishlistIds.has(perfume.id);
              const outOfStock = isSizeOutOfStock(perfume, quickSize);
              const stockLabel = getStockLabel(perfume);
              return (
                <div
                  key={perfume.id}
                  className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onViewNotes(perfume, quickSize);
                      onClose();
                    }}
                    className="flex items-center gap-4 min-w-0 text-left cursor-pointer group"
                  >
                    <div className="relative w-24 h-18 shrink-0 border border-[#DFD1B4] bg-[#F5EFE2] overflow-hidden group-hover:border-[#B58938] transition-colors">
                      <img
                        src={perfume.image}
                        alt={perfume.name}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${outOfStock ? 'opacity-80' : ''}`}
                      />
                      <div className="absolute top-1 left-1 flex flex-col items-start gap-0.5 pointer-events-none select-none">
                        {perfume.isBestSeller && (
                          <span className="px-1 py-0.5 bg-[#157347] border border-[#0F5132] text-[8px] font-semibold uppercase tracking-[0.1em] text-white leading-none">
                            Best Seller
                          </span>
                        )}
                        {outOfStock && (
                          <span className="px-1 py-0.5 bg-[#C62828] border border-[#991B1B] text-[8px] font-semibold uppercase tracking-[0.1em] text-white leading-none">
                            {stockLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#6D6254] truncate">
                        {perfume.house} · {perfume.displayFamily ?? perfume.family}
                      </div>
                      <div className="font-display text-xl text-[#1A1612] group-hover:text-[#8C641E] transition-colors truncate">
                        {perfume.name}
                      </div>
                      <div className="text-xs text-[#5C5347] truncate">
                        {[...perfume.notes.top.slice(0, 2), perfume.notes.heart[0]].join(', ')}
                      </div>
                    </div>
                  </button>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(perfume, quickSize)}
                      aria-label={isSaved ? `Remove ${perfume.name} from wishlist` : `Save ${perfume.name} to wishlist`}
                      aria-pressed={isSaved}
                      className={`min-w-[42px] min-h-[42px] flex items-center justify-center border transition-colors cursor-pointer ${
                        isSaved
                          ? 'border-[#B58938] bg-[#FBF6EA] text-[#8C641E]'
                          : 'bg-white border-[#DFD1B4] text-[#5C5347] hover:border-[#B58938] hover:text-[#1A1612]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C59B4A] text-[#9A7228]' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onViewNotes(perfume, quickSize);
                        onClose();
                      }}
                      className="min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#DFD1B4] text-xs text-[#1A1612] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-[#9A7228]" />
                      <span>Details &amp; Sizes</span>
                    </button>

                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        if (outOfStock) return;
                        onShopNow(perfume, quickSize);
                        onClose();
                      }}
                      className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                        outOfStock
                          ? 'bg-[#FEF2F2] border border-[#DC2626] text-[#B91C1C] cursor-not-allowed'
                          : 'bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {outOfStock ? (
                        <span>{stockLabel}</span>
                      ) : (
                        <>
                          <span>Shop</span>
                          <span className="font-mono tabular-nums">{formatBdt(price)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
