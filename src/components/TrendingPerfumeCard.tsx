import React, { useRef } from 'react';
import { ArrowUpRight, Heart } from 'lucide-react';
import {
  Perfume,
  PerfumeSizeId,
  formatBdt,
  getPriceForSize,
  getStockLabel,
  isPerfumeFullyOutOfStock,
} from '../data/perfumes';
import { OlfactoryNotesChart } from './OlfactoryNotesChart';

interface TrendingPerfumeCardProps {
  perfume: Perfume;
  isSaved: boolean;
  onOpenDetail: (perfume: Perfume) => void;
  onToggleWishlist: (perfume: Perfume, sizeId: PerfumeSizeId) => void;
}

export const TrendingPerfumeCard: React.FC<TrendingPerfumeCardProps> = ({
  perfume,
  isSaved,
  onOpenDetail,
  onToggleWishlist,
}) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const startingPrice = getPriceForSize(perfume, '3ML');
  const isOutOfStock = isPerfumeFullyOutOfStock(perfume);
  const stockLabel = getStockLabel(perfume);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width; // 0..1
    const ny = (e.clientY - rect.top) / rect.height; // 0..1

    const dx = nx - 0.5; // -0.5..0.5
    const dy = ny - 0.5; // -0.5..0.5

    // Subtle luxury tilt (±4deg) & gentle photo parallax (±7px)
    const rx = (-dy * 7.5).toFixed(2);
    const ry = (dx * 7.5).toFixed(2);
    const px = (-dx * 14).toFixed(2);
    const py = (-dy * 14).toFixed(2);
    const gx = (nx * 100).toFixed(1);
    const gy = (ny * 100).toFixed(1);

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = window.requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${rx}deg`);
      el.style.setProperty('--ry', `${ry}deg`);
      el.style.setProperty('--px', `${px}px`);
      el.style.setProperty('--py', `${py}px`);
      el.style.setProperty('--gx', `${gx}%`);
      el.style.setProperty('--gy', `${gy}%`);
      el.style.setProperty('--glint', '1');
      el.style.setProperty('--img-scale', '1.06');
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--px', '0px');
    el.style.setProperty('--py', '0px');
    el.style.setProperty('--glint', '0');
    el.style.setProperty('--img-scale', '1');
  };

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="sillux-tilt-card relative bg-white border border-[#E6DAC0] shadow-[0_12px_32px_-20px_rgba(120,88,30,0.18)] hover:shadow-[0_22px_48px_-20px_rgba(155,112,35,0.28)] flex flex-col justify-between hover:border-[#B88E3D]"
    >
      {/* Subtle Cursor-Tracked Champagne Specular Sheen */}
      <div
        aria-hidden="true"
        className="sillux-tilt-glint absolute inset-0 pointer-events-none z-10"
      />

      <div className="relative z-0">
        {/* 4:3 Clickable Studio Product Photo with Parallax Depth */}
        <div className="relative aspect-[4/3] w-full bg-[#F5EFE2] overflow-hidden border-b border-[#E6DAC0] group">
          <button
            type="button"
            onClick={() => onOpenDetail(perfume)}
            aria-label={`View ${perfume.name} details and select ML size`}
            className="block w-full h-full cursor-pointer text-left"
          >
            <img
              src={perfume.image}
              alt={`${perfume.name} by ${perfume.house}`}
              referrerPolicy="no-referrer"
              className={`sillux-tilt-image w-full h-full object-cover ${
                isOutOfStock ? 'opacity-75 grayscale-[25%]' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/55 via-transparent to-transparent pointer-events-none" />
            <span className="hidden sm:inline-block absolute bottom-3 left-3 text-[11px] font-medium tracking-wide text-[#1A1612] bg-white/95 border border-[#DFCFAF] px-2.5 py-1 shadow-sm group-hover:border-[#B88E3D] group-hover:text-[#8C641E] transition-colors">
              View Details &amp; Sizes
            </span>
          </button>

          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col items-start gap-1 sm:gap-1.5 pointer-events-none select-none">
            {perfume.isBestSeller && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-[#157347] border border-[#0F5132] text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.14em] text-white shadow-sm">
                Best Seller
              </span>
            )}
            {isOutOfStock && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-[#C62828] border border-[#991B1B] text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.14em] text-white shadow-sm">
                {stockLabel}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleWishlist(perfume, '10ML')}
            aria-label={
              isSaved
                ? `Remove ${perfume.name} from wishlist`
                : `Save ${perfume.name} to wishlist`
            }
            aria-pressed={isSaved}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 min-w-[40px] min-h-[40px] flex items-center justify-center bg-white/95 border shadow-sm transition-colors cursor-pointer ${
              isSaved
                ? 'border-[#B88E3D] text-[#9A7228]'
                : 'border-[#DFCFAF] text-[#5C5347] hover:border-[#B88E3D] hover:text-[#9A7228]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C59B4A]' : ''}`} />
          </button>
        </div>

        <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-2.5">
          {/* Unboxed Metadata (Zero Pills) */}
          <div className="text-[10px] sm:text-xs text-[#6D6254] flex items-center gap-1 sm:gap-1.5 min-w-0 truncate">
            <span className="truncate">{perfume.house}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate sm:shrink-0">
              {perfume.displayFamily ?? perfume.family}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-3">
            <h3 className="font-display text-sm sm:text-lg font-bold tracking-[-0.01em] text-[#1A1612] leading-snug">
              <button
                type="button"
                onClick={() => onOpenDetail(perfume)}
                className="text-left hover:text-[#8C641E] transition-colors cursor-pointer"
              >
                {perfume.name}
              </button>
            </h3>
            <span
              className={`font-mono tabular-nums text-xs sm:text-sm font-medium shrink-0 ${
                isOutOfStock ? 'text-[#C62828]' : 'text-[#8C641E]'
              }`}
            >
              {isOutOfStock ? stockLabel : `From ${formatBdt(startingPrice)}`}
            </span>
          </div>

          <p className="hidden md:block text-xs text-[#5C5347] leading-relaxed">
            {perfume.tagline}
          </p>

          {/* Notes Chart hidden on mobile homepage; shown inside PerfumeDetailModal on click */}
          <div className="hidden md:block">
            <OlfactoryNotesChart perfume={perfume} variant="compact" />
          </div>
        </div>
      </div>

      <div className="relative z-20 px-3 pb-3 pt-1 sm:px-5 sm:pb-5 sm:pt-2">
        <button
          type="button"
          onClick={() => onOpenDetail(perfume)}
          className={`w-full min-h-[44px] px-2 sm:px-3 py-2 sm:py-2.5 border transition-colors text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
            isOutOfStock
              ? 'border-[#DC2626] bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#C62828] hover:text-white hover:border-[#991B1B]'
              : 'border-[#D8C59B] bg-[#FBF6EA] text-[#1A1612] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612]'
          }`}
        >
          <span className="sm:hidden">
            {isOutOfStock ? `${stockLabel} · Notes` : 'View & Shop'}
          </span>
          <span className="hidden sm:inline">
            {isOutOfStock ? `${stockLabel} · View Notes` : 'Select Size & Shop'}
          </span>
          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
        </button>
      </div>
    </article>
  );
};
