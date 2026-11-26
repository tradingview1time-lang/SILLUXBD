import React from 'react';
import { X, Heart, BarChart3, ShoppingBag, Trash2 } from 'lucide-react';
import {
  PERFUME_SIZES,
  Perfume,
  PerfumeSizeId,
  formatBdt,
  getPriceForSize,
  getStockLabel,
  isSizeOutOfStock,
} from '../data/perfumes';

export interface WishlistEntry {
  perfume: Perfume;
  preferredSize: PerfumeSizeId;
  savedAt: number;
}

interface WishlistDrawerProps {
  open: boolean;
  entries: WishlistEntry[];
  onClose: () => void;
  onChangeSize: (perfumeId: string, sizeId: PerfumeSizeId) => void;
  onRemove: (perfumeId: string) => void;
  onClearAll: () => void;
  onViewNotes: (perfume: Perfume, sizeId: PerfumeSizeId) => void;
  onShopNow: (perfume: Perfume, sizeId: PerfumeSizeId) => void;
  onMoveAllToBag: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  open,
  entries,
  onClose,
  onChangeSize,
  onRemove,
  onClearAll,
  onViewNotes,
  onShopNow,
  onMoveAllToBag,
}) => {
  if (!open) return null;

  const availableEntries = entries.filter(
    (entry) => !isSizeOutOfStock(entry.perfume, entry.preferredSize)
  );
  const totalValue = availableEntries.reduce(
    (sum, entry) => sum + getPriceForSize(entry.perfume, entry.preferredSize),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1A1612]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Sillux saved wishlist"
    >
      <div className="flex-1" onClick={onClose} />

      <aside className="w-full max-w-md bg-[#FCFBF8] border-l border-[#DFD1B4] h-[100dvh] flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E7DCC4] bg-white shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#9A7228] font-semibold">
              Saved Curation
            </p>
            <h2 className="font-display text-2xl text-[#1A1612] mt-0.5">
              Your Wishlist ({entries.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-[#DFD1B4] text-[#5C5347] hover:text-[#1A1612] hover:border-[#B58938] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Saved Perfumes List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {entries.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-11 h-11 mx-auto border border-[#DFD1B4] bg-white flex items-center justify-center">
                <Heart className="w-4 h-4 text-[#9A7228]" />
              </div>
              <p className="font-display text-2xl text-[#1A1612]">No saved scents yet</p>
              <p className="text-xs text-[#5C5347] max-w-xs mx-auto leading-relaxed">
                Tap the heart icon on any fragrance in Trending to save it to your personal Sillux
                curation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const { perfume, preferredSize } = entry;
                const price = getPriceForSize(perfume, preferredSize);
                const outOfStock = isSizeOutOfStock(perfume, preferredSize);
                const stockLabel = getStockLabel(perfume);

                return (
                  <div
                    key={perfume.id}
                    className="p-4 bg-white border border-[#E5D8BC] space-y-3"
                  >
                    <div className="flex gap-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          onViewNotes(perfume, preferredSize);
                          onClose();
                        }}
                        aria-label={`Inspect ${perfume.name} details and sizes`}
                        className="relative w-24 h-18 shrink-0 border border-[#DFD1B4] bg-[#F5EFE2] overflow-hidden cursor-pointer hover:border-[#B58938] transition-colors"
                      >
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
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[11px] text-[#6D6254] truncate">
                              {perfume.house} · {perfume.displayFamily ?? perfume.family}
                            </div>
                            <h3 className="font-display text-xl text-[#1A1612] leading-tight truncate">
                              <button
                                type="button"
                                onClick={() => {
                                  onViewNotes(perfume, preferredSize);
                                  onClose();
                                }}
                                className="text-left hover:text-[#8C641E] transition-colors cursor-pointer truncate max-w-full"
                              >
                                {perfume.name}
                              </button>
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(perfume.id)}
                            aria-label={`Remove ${perfume.name} from wishlist`}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#8C8070] hover:text-[#1A1612] transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between text-xs">
                          <span className="text-[#5C5347] truncate">
                            {perfume.concentration}
                          </span>
                          <span
                            className={`font-mono tabular-nums text-sm font-medium shrink-0 ${
                              outOfStock ? 'text-[#C62828]' : 'text-[#8C641E]'
                            }`}
                          >
                            {outOfStock ? stockLabel : formatBdt(price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preferred ML Size Switcher */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-6 gap-1">
                        {PERFUME_SIZES.map((s) => {
                          const isSel = preferredSize === s.id;
                          const sizeOut = isSizeOutOfStock(perfume, s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              title={`${s.shortLabel} · ${s.spraysEstimate}`}
                              onClick={() => onChangeSize(perfume.id, s.id)}
                              className={`min-h-[36px] py-1 text-[10px] font-mono tabular-nums border text-center transition-colors cursor-pointer ${
                                sizeOut
                                  ? isSel
                                    ? 'bg-[#C62828] text-white border-[#991B1B] font-semibold line-through'
                                    : 'bg-[#FEF2F2] text-[#B91C1C] border-[#DC2626] line-through'
                                  : isSel
                                    ? 'bg-[#D6B265] text-[#1A1612] border-[#B58938] font-semibold'
                                    : 'bg-[#FAF7F0] text-[#5C5347] border-[#DFD1B4] hover:text-[#1A1612]'
                              }`}
                            >
                              {s.id === 'FULL' ? 'Full' : s.shortLabel}
                            </button>
                          );
                        })}
                      </div>
                      <div className="text-[11px] font-mono text-[#8C641E]">
                        {PERFUME_SIZES.find((s) => s.id === preferredSize)?.shortLabel}:{' '}
                        {PERFUME_SIZES.find((s) => s.id === preferredSize)?.spraysEstimate}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          onViewNotes(perfume, preferredSize);
                          onClose();
                        }}
                        className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-1.5 py-2 bg-white border border-[#DFD1B4] text-xs text-[#1A1612] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors cursor-pointer"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#9A7228]" />
                        <span>Details &amp; Sizes</span>
                      </button>

                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => {
                          if (outOfStock) return;
                          onShopNow(perfume, preferredSize);
                          onClose();
                        }}
                        className={`flex-1 min-h-[42px] inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
                          outOfStock
                            ? 'bg-[#FEF2F2] border border-[#DC2626] text-[#B91C1C] cursor-not-allowed'
                            : 'bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white cursor-pointer'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{outOfStock ? stockLabel : 'Add to Bag'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {entries.length > 0 && (
          <div className="p-4 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-[#E2D6BC] bg-[#F5EFE3] space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs text-[#5C5347]">
              <span>Saved across sessions automatically</span>
              <button
                type="button"
                onClick={onClearAll}
                className="text-[#6D6254] hover:text-[#1A1612] underline-offset-4 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="flex items-center justify-between text-sm font-semibold text-[#1A1612]">
              <span>Available Selection Total</span>
              <span className="font-mono tabular-nums text-base">{formatBdt(totalValue)}</span>
            </div>

            <button
              type="button"
              disabled={availableEntries.length === 0}
              onClick={onMoveAllToBag}
              className={`w-full min-h-[44px] py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                availableEntries.length === 0
                  ? 'bg-[#FEF2F2] border border-[#DC2626] text-[#B91C1C] cursor-not-allowed'
                  : 'bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {availableEntries.length === 0
                  ? 'Selected Sizes Are Stock Out'
                  : `Add ${availableEntries.length} Available to Bag · ${formatBdt(totalValue)}`}
              </span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
