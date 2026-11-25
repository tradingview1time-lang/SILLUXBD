import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  ShoppingBag,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  RotateCcw,
} from 'lucide-react';
import {
  CONTACT_INFO,
  PERFUME_SIZES,
  Perfume,
  PerfumeSizeId,
  formatBdt,
  getFirstAvailableSize,
  getMlSelectorBannerImage,
  getPerfumeGallery,
  getPriceForSize,
  getStockLabel,
  isPerfumeFullyOutOfStock,
  isSizeOutOfStock,
} from '../data/perfumes';
import { OlfactoryNotesChart } from './OlfactoryNotesChart';

type MlBannerScope = 'size' | 'perfume-size';

interface MlSizePhotoOverrides {
  bySize?: Partial<Record<PerfumeSizeId, string>>;
  byPerfumeSize?: Record<string, Partial<Record<PerfumeSizeId, string>>>;
}

const ML_SIZE_PHOTOS_STORAGE_KEY = 'sillux_ml_size_photos_v2';

function loadMlSizePhotoOverrides(): MlSizePhotoOverrides {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ML_SIZE_PHOTOS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as MlSizePhotoOverrides;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

async function prepareUploadedBannerImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read selected image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });

  if (file.size <= 240_000) {
    return dataUrl;
  }

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1080;
      const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
      const targetW = Math.max(1, Math.round(img.width * scale));
      const targetH = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(outputType, 0.86));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

interface PerfumeDetailModalProps {
  perfume: Perfume | null;
  initialSize?: PerfumeSizeId;
  isSaved: boolean;
  onClose: () => void;
  onToggleWishlist: (perfume: Perfume, sizeId: PerfumeSizeId) => void;
  onShopNow: (perfume: Perfume, sizeId: PerfumeSizeId) => void;
}

export const PerfumeDetailModal: React.FC<PerfumeDetailModalProps> = ({
  perfume,
  initialSize = '10ML',
  isSaved,
  onClose,
  onToggleWishlist,
  onShopNow,
}) => {
  const [selectedSize, setSelectedSize] = useState<PerfumeSizeId>(initialSize);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [buttonPulse, setButtonPulse] = useState<{
    side: 'prev' | 'next';
    seq: number;
  } | null>(null);
  const [mlSizeOverrides, setMlSizeOverrides] = useState<MlSizePhotoOverrides>(() =>
    loadMlSizePhotoOverrides()
  );
  const [uploadScope, setUploadScope] = useState<MlBannerScope>(
    initialSize === 'FULL' ? 'perfume-size' : 'size'
  );
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const galleryTrackRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const gallery = perfume ? getPerfumeGallery(perfume) : [];

  const scrollToPhoto = useCallback(
    (targetIndex: number, behavior: ScrollBehavior = 'smooth') => {
      setActiveImageIndex(targetIndex);
      const track = galleryTrackRef.current;
      if (track) {
        track.scrollTo({
          left: targetIndex * track.clientWidth,
          behavior,
        });
      }
    },
    []
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ML_SIZE_PHOTOS_STORAGE_KEY) {
        setMlSizeOverrides(loadMlSizePhotoOverrides());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!perfume) return;
    const initialResolved = getFirstAvailableSize(perfume, initialSize);
    setSelectedSize(initialResolved);
    setUploadScope(initialResolved === 'FULL' ? 'perfume-size' : 'size');
    setActiveImageIndex(0);
    setButtonPulse(null);
    setUploadFeedback(null);
    if (galleryTrackRef.current) {
      galleryTrackRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [perfume, initialSize]);

  useEffect(() => {
    if (!perfume) return;
    const total = getPerfumeGallery(perfume).length;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => {
          const next = (prev - 1 + total) % total;
          const track = galleryTrackRef.current;
          if (track) track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
          return next;
        });
        setButtonPulse((prev) => ({ side: 'prev', seq: (prev?.seq ?? 0) + 1 }));
      }
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => {
          const next = (prev + 1) % total;
          const track = galleryTrackRef.current;
          if (track) track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
          return next;
        });
        setButtonPulse((prev) => ({ side: 'next', seq: (prev?.seq ?? 0) + 1 }));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [perfume, onClose]);

  if (!perfume) return null;

  const handlePrevImage = () => {
    const nextIdx = (activeImageIndex - 1 + gallery.length) % gallery.length;
    scrollToPhoto(nextIdx);
    setButtonPulse((prev) => ({ side: 'prev', seq: (prev?.seq ?? 0) + 1 }));
  };
  const handleNextImage = () => {
    const nextIdx = (activeImageIndex + 1) % gallery.length;
    scrollToPhoto(nextIdx);
    setButtonPulse((prev) => ({ side: 'next', seq: (prev?.seq ?? 0) + 1 }));
  };
  const handleSelectThumb = (idx: number) => {
    if (idx === activeImageIndex) return;
    scrollToPhoto(idx);
  };
  const handleTrackScroll = () => {
    const track = galleryTrackRef.current;
    if (!track || track.clientWidth <= 0) return;
    const snappedIndex = Math.round(track.scrollLeft / track.clientWidth);
    if (snappedIndex >= 0 && snappedIndex < gallery.length && snappedIndex !== activeImageIndex) {
      setActiveImageIndex(snappedIndex);
    }
  };
  const photoLabels = ['Signature Flacon', 'Decant Size Guide', 'Authenticity Certificate'];

  const sizeMeta = PERFUME_SIZES.find((s) => s.id === selectedSize) ?? PERFUME_SIZES[2];
  const currentPrice = getPriceForSize(perfume, selectedSize);
  const selectedSizeStockOut = isSizeOutOfStock(perfume, selectedSize);
  const fullyStockOut = isPerfumeFullyOutOfStock(perfume);
  const stockLabel = getStockLabel(perfume);

  const getSizePhoto = (sizeId: PerfumeSizeId): string => {
    return (
      mlSizeOverrides.byPerfumeSize?.[perfume.id]?.[sizeId] ||
      perfume.mlSizeImages?.[sizeId] ||
      mlSizeOverrides.bySize?.[sizeId] ||
      getMlSelectorBannerImage(perfume, sizeId)
    );
  };

  const selectedSizeDisplayLabel =
    sizeMeta.id === 'FULL' ? 'Full Bottle' : sizeMeta.shortLabel;
  const perfumeSizeCustom = mlSizeOverrides.byPerfumeSize?.[perfume.id]?.[selectedSize];
  const sharedSizeCustom = mlSizeOverrides.bySize?.[selectedSize];
  const activeCustomScope: MlBannerScope | null = perfumeSizeCustom
    ? 'perfume-size'
    : sharedSizeCustom
      ? 'size'
      : null;

  const persistSizePhotoOverrides = (next: MlSizePhotoOverrides, confirmation: string) => {
    try {
      window.localStorage.setItem(ML_SIZE_PHOTOS_STORAGE_KEY, JSON.stringify(next));
      setMlSizeOverrides(next);
      setUploadFeedback(confirmation);
    } catch {
      setUploadFeedback(
        'Browser storage limit reached — please reset an older custom photo or use a smaller image.'
      );
    }
  };

  const applyUploadedFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadFeedback('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    try {
      const processed = await prepareUploadedBannerImage(file);
      const next: MlSizePhotoOverrides = {
        bySize: { ...(mlSizeOverrides.bySize ?? {}) },
        byPerfumeSize: { ...(mlSizeOverrides.byPerfumeSize ?? {}) },
      };
      if (uploadScope === 'perfume-size') {
        next.byPerfumeSize![perfume.id] = {
          ...(next.byPerfumeSize![perfume.id] ?? {}),
          [selectedSize]: processed,
        };
        persistSizePhotoOverrides(
          next,
          `Saved separate ${selectedSizeDisplayLabel} bottle photo for ${perfume.name}.`
        );
      } else {
        next.bySize![selectedSize] = processed;
        persistSizePhotoOverrides(
          next,
          `Saved separate ${selectedSizeDisplayLabel} bottle photo across perfumes.`
        );
      }
    } catch {
      setUploadFeedback('Could not load the selected image file. Please try another photo.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    void applyUploadedFile(file);
    e.target.value = '';
  };

  const handleResetCustomImage = () => {
    if (!activeCustomScope) return;
    const next: MlSizePhotoOverrides = {
      bySize: { ...(mlSizeOverrides.bySize ?? {}) },
      byPerfumeSize: { ...(mlSizeOverrides.byPerfumeSize ?? {}) },
    };
    if (activeCustomScope === 'perfume-size' && next.byPerfumeSize?.[perfume.id]) {
      const updatedSizes = { ...next.byPerfumeSize[perfume.id] };
      delete updatedSizes[selectedSize];
      next.byPerfumeSize[perfume.id] = updatedSizes;
    } else if (activeCustomScope === 'size' && next.bySize) {
      delete next.bySize[selectedSize];
    }
    persistSizePhotoOverrides(
      next,
      `Restored default ${selectedSizeDisplayLabel} bottle image.`
    );
  };

  const whatsappInquiry = `${CONTACT_INFO.whatsappUrl}?text=${encodeURIComponent(
    selectedSizeStockOut
      ? `Hello Sillux, could you notify me when ${perfume.name} (${sizeMeta.label}) is back in stock?`
      : `Hello Sillux, I would like to inquire about ${perfume.name} (${sizeMeta.label} - ${formatBdt(currentPrice)} BDT).`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1A1612]/48 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${perfume.name} details and size selection`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl bg-white border border-[#DECFA9] shadow-[0_30px_80px_-24px_rgba(26,22,18,0.35)] overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-7 py-3.5 sm:py-4 border-b border-[#E7DCC4] bg-[#FAF6ED] shrink-0">
          <div className="text-xs text-[#5C5347] flex items-center gap-2 truncate min-w-0">
            <span className="text-[#8C641E] uppercase tracking-[0.16em] font-semibold truncate">
              {perfume.house}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{perfume.displayFamily ?? perfume.family}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{perfume.concentration}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close perfume details"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-[#DFCFAF] text-[#5C5347] hover:text-[#1A1612] hover:border-[#B58938] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Two-Column PDP Body */}
        <div className="overflow-y-auto overscroll-contain p-4 sm:p-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 3-Image Horizontally Scrollable Gallery & Fragrance Profile */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2.5">
                <div className="relative aspect-square w-full bg-[#F5EFE2] border border-[#E5D8BC] overflow-hidden">
                  {/* Horizontal Snap-Scroll 3-Photo Track */}
                  <div
                    ref={galleryTrackRef}
                    onScroll={handleTrackScroll}
                    className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth sillux-no-scrollbar"
                  >
                    {gallery.map((imgSrc, idx) => (
                      <div
                        key={`${perfume.id}-slide-${idx}`}
                        className="w-full h-full shrink-0 snap-center snap-always"
                      >
                        <img
                          src={imgSrc}
                          alt={`${perfume.name} by ${perfume.house} — ${
                            photoLabels[idx] ?? `Photo ${idx + 1}`
                          }`}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full ${
                            idx === 0 ? 'object-cover' : 'object-contain bg-[#FAF6ED]'
                          } ${fullyStockOut ? 'opacity-80' : ''}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none select-none z-10">
                    {perfume.isBestSeller && (
                      <span className="px-2 py-0.5 bg-[#157347] border border-[#0F5132] text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                        Best Seller
                      </span>
                    )}
                    {fullyStockOut && (
                      <span className="px-2 py-0.5 bg-[#C62828] border border-[#991B1B] text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                        {stockLabel}
                      </span>
                    )}
                  </div>

                  {/* Leftward Slide Button (Permanent) */}
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10">
                    {buttonPulse?.side === 'prev' && (
                      <span
                        key={`prev-ring-${buttonPulse.seq}`}
                        aria-hidden="true"
                        className="animate-sillux-btn-ring pointer-events-none absolute inset-0 border-2 border-[#D6B265]"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      aria-label="Previous perfume photo"
                      className="sillux-gallery-btn group relative overflow-hidden min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/95 backdrop-blur-sm border border-[#D8C59B] text-[#1A1612] hover:bg-[#1A1612] hover:text-[#D6B265] hover:border-[#C59B4A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4A] shadow-[0_6px_18px_-6px_rgba(26,22,18,0.28)] cursor-pointer"
                    >
                      <span
                        aria-hidden="true"
                        className="sillux-gallery-btn-sheen pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#E9CF8E]/45 to-transparent"
                      />
                      <ChevronLeft className="relative z-10 w-5 h-5 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
                    </button>
                  </div>

                  {/* Rightward Slide Button (Permanent) */}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10">
                    {buttonPulse?.side === 'next' && (
                      <span
                        key={`next-ring-${buttonPulse.seq}`}
                        aria-hidden="true"
                        className="animate-sillux-btn-ring pointer-events-none absolute inset-0 border-2 border-[#D6B265]"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next perfume photo"
                      className="sillux-gallery-btn group relative overflow-hidden min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/95 backdrop-blur-sm border border-[#D8C59B] text-[#1A1612] hover:bg-[#1A1612] hover:text-[#D6B265] hover:border-[#C59B4A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4A] shadow-[0_6px_18px_-6px_rgba(26,22,18,0.28)] cursor-pointer"
                    >
                      <span
                        aria-hidden="true"
                        className="sillux-gallery-btn-sheen pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#E9CF8E]/45 to-transparent"
                      />
                      <ChevronRight className="relative z-10 w-5 h-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  {/* Photo Index Counter */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-[#DFCFAF] text-[11px] font-mono tabular-nums font-semibold text-[#1A1612] pointer-events-none select-none overflow-hidden">
                    <span key={activeImageIndex} className="inline-block animate-sillux-counter">
                      {activeImageIndex + 1} / {gallery.length}
                    </span>
                  </div>
                </div>

                {/* 3 Thumbnail Selectors */}
                <div className="grid grid-cols-3 gap-2" aria-label="Perfume gallery thumbnails">
                  {gallery.map((imgSrc, idx) => {
                    const isActive = idx === activeImageIndex;
                    return (
                      <button
                        key={`${perfume.id}-thumb-${idx}`}
                        type="button"
                        onClick={() => handleSelectThumb(idx)}
                        aria-label={`View photo ${idx + 1} of ${gallery.length}: ${
                          photoLabels[idx] ?? 'Gallery view'
                        }`}
                        aria-current={isActive}
                        className={`group relative aspect-square overflow-hidden border transition-all duration-200 ease-out cursor-pointer bg-[#F5EFE2] hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4A] ${
                          isActive
                            ? 'border-[#9A7228] ring-1 ring-[#C59B4A] shadow-[0_6px_14px_-6px_rgba(154,114,40,0.32)]'
                            : 'border-[#E5D8BC] opacity-75 hover:opacity-100 hover:border-[#B58938]'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={`${perfume.name} view ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.04] ${
                            idx === 0 ? 'object-cover' : 'object-contain bg-[#FAF6ED]'
                          }`}
                        />
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-0 bottom-0 h-[2px] bg-[#C59B4A] transition-transform duration-250 ease-out origin-left ${
                            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.015em] text-[#1A1612] leading-tight">
                    {perfume.name}
                  </h2>
                </div>
                <p className="text-sm text-[#5C5347] leading-relaxed">{perfume.tagline}</p>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#ECE2CE] text-xs">
                  <div>
                    <div className="text-[#7C7162]">Longevity</div>
                    <div className="text-[#1A1612] font-medium mt-0.5">{perfume.longevity}</div>
                  </div>
                  <div>
                    <div className="text-[#7C7162]">Sillage</div>
                    <div className="text-[#1A1612] font-medium mt-0.5">{perfume.sillage}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contiguous Size Selection, Purchase Module & Olfactory Notes Chart */}
            <div className="lg:col-span-7 space-y-6">
              {/* Size Selector Module */}
              <div className="p-5 bg-[#FAF7F0] border border-[#E3D6BC] space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-[#8C641E] font-semibold">
                      Select Vessel Size
                    </div>
                    <div className="text-sm font-medium text-[#1A1612] mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{sizeMeta.label}</span>
                      {selectedSizeStockOut && (
                        <span className="px-1.5 py-0.5 bg-[#C62828] text-white text-[10px] font-semibold uppercase tracking-[0.12em]">
                          {stockLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono tabular-nums text-2xl font-medium ${
                        selectedSizeStockOut ? 'text-[#B91C1C] line-through' : 'text-[#1A1612]'
                      }`}
                    >
                      {formatBdt(currentPrice)}
                    </div>
                    <div
                      className={`text-[11px] font-mono tabular-nums ${
                        selectedSizeStockOut ? 'text-[#C62828] font-semibold' : 'text-[#8C641E]'
                      }`}
                    >
                      {selectedSizeStockOut ? `Currently ${stockLabel}` : sizeMeta.spraysEstimate}
                    </div>
                  </div>
                </div>

                {/* Compact Per-Size Bottle Photo Upload Bar */}
                <div className="border border-[#DFD1B4] bg-[#FBF8F2]">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <div className="text-[11px] text-[#5C5347] flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold uppercase tracking-[0.12em] text-[#8C641E] whitespace-nowrap">
                        {selectedSizeDisplayLabel} Bottle Photo
                      </span>
                      {activeCustomScope && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate text-[#1A1612] font-medium">
                            {activeCustomScope === 'perfume-size'
                              ? `${perfume.name} Only`
                              : 'All Scents'}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="sr-only" htmlFor="ml-banner-scope-select">
                        Apply bottle photo to
                      </label>
                      <select
                        id="ml-banner-scope-select"
                        value={uploadScope}
                        onChange={(e) => setUploadScope(e.target.value as MlBannerScope)}
                        className="min-h-[34px] px-2 py-1 bg-white border border-[#DFD1B4] text-[11px] text-[#2B241D] focus:outline-none focus:border-[#B58938] cursor-pointer"
                      >
                        <option value="size">
                          {selectedSizeDisplayLabel} (All Perfumes)
                        </option>
                        <option value="perfume-size">
                          {selectedSizeDisplayLabel} ({perfume.name} Only)
                        </option>
                      </select>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#DFD1B4] hover:border-[#B58938] hover:bg-[#FBF6EA] text-[11px] font-semibold text-[#1A1612] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <ImagePlus className="w-3.5 h-3.5 text-[#8C641E]" />
                        <span>
                          {activeCustomScope
                            ? `Change ${sizeMeta.id === 'FULL' ? 'Full' : sizeMeta.shortLabel} Photo`
                            : `Add ${sizeMeta.id === 'FULL' ? 'Full' : sizeMeta.shortLabel} Photo`}
                        </span>
                      </button>

                      {activeCustomScope && (
                        <button
                          type="button"
                          onClick={handleResetCustomImage}
                          aria-label={`Reset ${selectedSizeDisplayLabel} custom photo`}
                          title="Reset to default image"
                          className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#DFD1B4] hover:border-[#C62828] hover:text-[#B91C1C] text-[11px] font-medium text-[#5C5347] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span className="hidden sm:inline">Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {uploadFeedback && (
                    <div className="px-3 py-1.5 border-t border-[#ECE2CE] bg-[#FAF6ED] text-[11px] text-[#5C5347]">
                      {uploadFeedback}
                    </div>
                  )}
                </div>

                {/* 6 Interactive Size Buttons — Each With Its Own Separate Bottle Photo */}
                <div
                  className="grid grid-cols-3 sm:grid-cols-6 gap-2"
                  role="radiogroup"
                  aria-label="Choose perfume ML size"
                >
                  {PERFUME_SIZES.map((s) => {
                    const active = selectedSize === s.id;
                    const out = isSizeOutOfStock(perfume, s.id);
                    const priceForOpt = getPriceForSize(perfume, s.id);
                    const optImage = getSizePhoto(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          setSelectedSize(s.id);
                          setUploadScope(s.id === 'FULL' ? 'perfume-size' : 'size');
                          setUploadFeedback(null);
                        }}
                        className={`flex flex-col overflow-hidden border text-center transition-colors cursor-pointer ${
                          out
                            ? active
                              ? 'bg-[#C62828] text-white border-[#991B1B]'
                              : 'bg-[#FEF2F2] text-[#B91C1C] border-[#DC2626] hover:bg-[#FEE2E2]'
                            : active
                              ? 'bg-[#D6B265] text-[#1A1612] border-[#B58938] ring-1 ring-[#B58938]'
                              : 'bg-white text-[#2B241D] border-[#DFD1B4] hover:border-[#B58938] hover:text-[#1A1612]'
                        }`}
                      >
                        <div className="aspect-square w-full bg-[#14110E] border-b border-[#E5D8BC] overflow-hidden">
                          <img
                            src={optImage}
                            alt={`${perfume.name} ${s.shortLabel} bottle`}
                            referrerPolicy="no-referrer"
                            className={`w-full h-full ${
                              s.id === 'FULL' ? 'object-cover' : 'object-contain'
                            } ${out ? 'opacity-70 grayscale-[25%]' : ''}`}
                          />
                        </div>
                        <div className="py-2 px-1 w-full">
                          <div
                            className={`text-xs font-mono tabular-nums font-semibold ${
                              out ? 'line-through' : ''
                            }`}
                          >
                            {s.id === 'FULL' ? 'Full' : s.shortLabel}
                          </div>
                          <div
                            className={`text-[9px] font-mono tabular-nums mt-0.5 ${
                              out
                                ? active
                                  ? 'text-white font-semibold'
                                  : 'text-[#C62828] font-semibold'
                                : active
                                  ? 'text-[#1A1612]/85 font-medium'
                                  : 'text-[#6D6254]'
                            }`}
                          >
                            {out ? (
                              <>
                                <span className="block line-through opacity-80">
                                  {formatBdt(priceForOpt)}
                                </span>
                                <span className="block text-[8px] uppercase tracking-wide mt-0.5">
                                  {stockLabel}
                                </span>
                              </>
                            ) : (
                              formatBdt(priceForOpt)
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-[#5C5347] leading-relaxed">
                  <span className="text-[#1A1612] font-semibold">{sizeMeta.vesselName}:</span>{' '}
                  {sizeMeta.description}
                </p>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={selectedSizeStockOut}
                    onClick={() => {
                      if (selectedSizeStockOut) return;
                      onShopNow(perfume, selectedSize);
                      onClose();
                    }}
                    className={`flex-1 min-w-[200px] min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedSizeStockOut
                        ? 'bg-[#FEF2F2] border border-[#DC2626] text-[#B91C1C] cursor-not-allowed'
                        : 'bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white cursor-pointer'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>
                      {selectedSizeStockOut
                        ? `${stockLabel} · ${sizeMeta.id === 'FULL' ? 'Full Bottle' : sizeMeta.shortLabel}`
                        : `Shop Now · ${sizeMeta.id === 'FULL' ? 'Full Bottle' : sizeMeta.shortLabel} · ${formatBdt(currentPrice)}`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleWishlist(perfume, selectedSize)}
                    aria-pressed={isSaved}
                    className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-3 border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isSaved
                        ? 'border-[#B58938] bg-[#FBF6EA] text-[#8C641E]'
                        : 'bg-white border-[#DFD1B4] text-[#2B241D] hover:border-[#B58938] hover:text-[#1A1612]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C59B4A] text-[#9A7228]' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <a
                    href={whatsappInquiry}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-[#DFD1B4] text-xs font-medium text-[#8C641E] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{selectedSizeStockOut ? 'Request Restock' : 'Ask on WhatsApp'}</span>
                  </a>
                </div>
              </div>

              {/* Detailed Olfactory Notes & Accord Chart */}
              <OlfactoryNotesChart perfume={perfume} variant="full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
