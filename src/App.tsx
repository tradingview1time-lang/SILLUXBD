import React, { useEffect, useMemo, useState } from 'react';
import {
  Menu,
  Search,
  ShoppingBag,
  Phone,
  MessageCircle,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Heart,
  ShieldCheck,
  RotateCcw,
  Lock,
  Truck,
  BadgeCheck,
  Mail,
} from 'lucide-react';
import {
  CONTACT_INFO,
  DECANTING_STEPS,
  FAQ_ITEMS,
  PERFUME_SIZES,
  PERFUMES,
  Perfume,
  PerfumeSizeId,
  ScentFamily,
  getFirstAvailableSize,
  getStockLabel,
  getUniquePerfumesByImage,
  isSizeOutOfStock,
} from './data/perfumes';
import { ExploreMenuDrawer, ExploreTab } from './components/ExploreMenuDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { CartItem, ShoppingBagDrawer } from './components/ShoppingBagDrawer';
import { WishlistDrawer, WishlistEntry } from './components/WishlistDrawer';
import { PerfumeDetailModal } from './components/PerfumeDetailModal';
import { LuxuryVideoBanner } from './components/LuxuryVideoBanner';
import { AuthenticityRefundPage, PolicyPageTab } from './components/AuthenticityRefundPage';
import { OrderStatusModal } from './components/OrderStatusModal';
import { TrendingPerfumeCard } from './components/TrendingPerfumeCard';
import {
  CookieConsentPopup,
  CookiePreferences,
  loadCookieConsent,
} from './components/CookieConsentPopup';
import { SilluxChatbox } from './components/SilluxChatbox';
import { googleSignIn, initAuth, logout } from './lib/gmailAuth';

const WISHLIST_STORAGE_KEY = 'sillux_wishlist_v1';

interface StoredWishlistRecord {
  perfumeId: string;
  preferredSize: PerfumeSizeId;
  savedAt: number;
}

function loadWishlistFromStorage(): StoredWishlistRecord[] {
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const validPerfumeIds = new Set(PERFUMES.map((p) => p.id));
    const validSizes = new Set(PERFUME_SIZES.map((s) => s.id));
    return parsed.filter(
      (item): item is StoredWishlistRecord =>
        Boolean(item) &&
        typeof item.perfumeId === 'string' &&
        validPerfumeIds.has(item.perfumeId) &&
        typeof item.preferredSize === 'string' &&
        validSizes.has(item.preferredSize as PerfumeSizeId)
    );
  } catch {
    return [];
  }
}

const FAMILY_FILTERS: Array<'All' | 'Best Sellers' | ScentFamily> = [
  'All',
  'Best Sellers',
  'Oud & Wood',
  'Amber & Spice',
  'Fresh & Citrus',
  'Floral & Leather',
];

export default function App() {
  // Selected perfume detail modal state (opened by clicking perfume photos)
  const [detailState, setDetailState] = useState<{
    perfume: Perfume;
    initialSize: PerfumeSizeId;
  } | null>(null);

  // Page View ('store' vs dedicated 'authenticity' or 'refund' policy pages)
  const [activePage, setActivePage] = useState<'store' | PolicyPageTab>('store');

  // Trending filter
  const [familyFilter, setFamilyFilter] = useState<'All' | 'Best Sellers' | ScentFamily>('All');

  // Overlays
  const [exploreOpen, setExploreOpen] = useState(false);
  const [exploreTab, setExploreTab] = useState<ExploreTab>('contact');
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [orderStatusOpen, setOrderStatusOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // New-visitor Cookie Consent state
  const [cookiePrefs, setCookiePrefs] = useState<CookiePreferences | null>(() =>
    loadCookieConsent()
  );
  const [cookiePopupOpen, setCookiePopupOpen] = useState<boolean>(
    () => loadCookieConsent() === null
  );

  // FAQ state on page
  const [openFaq, setOpenFaq] = useState<number>(0);

  // Cart items
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // In-memory Google OAuth session for Gmail order alerts (never stored in localStorage)
  const [gmailUserEmail, setGmailUserEmail] = useState<string | null>(null);
  const [gmailAccessToken, setGmailAccessToken] = useState<string | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGmailUserEmail(user.email ?? null);
        setGmailAccessToken(token);
      },
      () => {
        setGmailAccessToken(null);
        setGmailUserEmail(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Persisted Wishlist
  const [wishlistRecords, setWishlistRecords] = useState<StoredWishlistRecord[]>(() =>
    loadWishlistFromStorage()
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistRecords));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [wishlistRecords]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === WISHLIST_STORAGE_KEY) {
        setWishlistRecords(loadWishlistFromStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const wishlistEntries: WishlistEntry[] = useMemo(() => {
    return wishlistRecords
      .map((rec) => {
        const perfume = PERFUMES.find((p) => p.id === rec.perfumeId);
        if (!perfume) return null;
        return {
          perfume,
          preferredSize: rec.preferredSize,
          savedAt: rec.savedAt,
        };
      })
      .filter((entry): entry is WishlistEntry => entry !== null)
      .sort((a, b) => {
        const aBest = a.perfume.isBestSeller ? 1 : 0;
        const bBest = b.perfume.isBestSeller ? 1 : 0;
        if (aBest !== bBest) return bBest - aBest;
        const rankDiff = (a.perfume.bestsellerRank ?? 99) - (b.perfume.bestsellerRank ?? 99);
        if (rankDiff !== 0) return rankDiff;
        return b.savedAt - a.savedAt;
      });
  }, [wishlistRecords]);

  const wishlistIds = useMemo(
    () => new Set(wishlistRecords.map((r) => r.perfumeId)),
    [wishlistRecords]
  );

  const totalBagCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const uniqueHomePerfumes = useMemo(
    () => getUniquePerfumesByImage(PERFUMES.filter((p) => !p.bestSellerOnly && !p.hiddenFromHome)),
    []
  );

  const trendingPerfumes = useMemo(() => {
    if (familyFilter === 'All') return uniqueHomePerfumes;
    if (familyFilter === 'Best Sellers') {
      return getUniquePerfumesByImage(PERFUMES.filter((p) => p.isBestSeller));
    }
    return uniqueHomePerfumes.filter((p) => p.family === familyFilter);
  }, [familyFilter, uniqueHomePerfumes]);

  const handleViewAllBestSellers = () => {
    setFamilyFilter('Best Sellers');
    const el = document.getElementById('trending');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGmailUserEmail(result.user.email ?? null);
        setGmailAccessToken(result.accessToken);
        showToast(`Connected Google account (${result.user.email ?? 'Gmail ready'})`);
      }
    } catch {
      showToast('Google Sign-In was cancelled or could not complete');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGmailUserEmail(null);
    setGmailAccessToken(null);
    showToast('Disconnected Gmail account');
  };

  const handleShopNow = (perfume: Perfume, sizeId: PerfumeSizeId) => {
    const sizeLabel = PERFUME_SIZES.find((s) => s.id === sizeId)?.shortLabel ?? sizeId;
    if (isSizeOutOfStock(perfume, sizeId)) {
      showToast(`${perfume.name} (${sizeLabel}) is currently ${getStockLabel(perfume)}`);
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.perfume.id === perfume.id && item.sizeId === sizeId
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { perfume, sizeId, quantity: 1 }];
    });
    showToast(`Added ${perfume.name} (${sizeLabel}) to your bag`);
    setBagOpen(true);
  };

  const handleAddToCart = (perfume: Perfume, sizeId: PerfumeSizeId) => {
    const sizeLabel = PERFUME_SIZES.find((s) => s.id === sizeId)?.shortLabel ?? sizeId;
    if (isSizeOutOfStock(perfume, sizeId)) {
      showToast(`${perfume.name} (${sizeLabel}) is currently ${getStockLabel(perfume)}`);
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.perfume.id === perfume.id && item.sizeId === sizeId
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { perfume, sizeId, quantity: 1 }];
    });
    showToast(`Added ${perfume.name} (${sizeLabel}) to your bag`);
  };

  const handleQuickAdd10Ml = (perfume: Perfume) => {
    const chosenSize = getFirstAvailableSize(perfume, '10ML');
    const sizeLabel = PERFUME_SIZES.find((s) => s.id === chosenSize)?.shortLabel ?? chosenSize;
    if (isSizeOutOfStock(perfume, chosenSize)) {
      showToast(`${perfume.name} is currently ${getStockLabel(perfume)}`);
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.perfume.id === perfume.id && item.sizeId === chosenSize
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { perfume, sizeId: chosenSize, quantity: 1 }];
    });
    showToast(`Added ${perfume.name} (${sizeLabel}) to your bag`);
  };

  const openPerfumeDetail = (perfume: Perfume, initialSize: PerfumeSizeId = '10ML') => {
    setDetailState({ perfume, initialSize });
  };

  const handleUpdateQty = (perfumeId: string, sizeId: PerfumeSizeId, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.perfume.id === perfumeId && item.sizeId === sizeId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (perfumeId: string, sizeId: PerfumeSizeId) => {
    setCart((prev) =>
      prev.filter((item) => !(item.perfume.id === perfumeId && item.sizeId === sizeId))
    );
  };

  const handleNavigateSection = (sectionId: string) => {
    if (activePage !== 'store') {
      setActivePage('store');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 45);
      return;
    }
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openPolicyPage = (tab: PolicyPageTab) => {
    setActivePage(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openExploreWithTab = (tab: ExploreTab) => {
    setExploreTab(tab);
    setExploreOpen(true);
  };

  const openOrderTracking = (orderId?: string) => {
    setTrackingOrderId(orderId ?? null);
    setOrderStatusOpen(true);
  };

  const handleToggleWishlist = (perfume: Perfume, preferredSize: PerfumeSizeId) => {
    const exists = wishlistIds.has(perfume.id);
    if (exists) {
      setWishlistRecords((prev) => prev.filter((r) => r.perfumeId !== perfume.id));
      showToast(`Removed ${perfume.name} from your wishlist`);
    } else {
      setWishlistRecords((prev) => [
        { perfumeId: perfume.id, preferredSize, savedAt: Date.now() },
        ...prev,
      ]);
      showToast(`Saved ${perfume.name} to your wishlist`);
    }
  };

  const handleWishlistSizeChange = (perfumeId: string, sizeId: PerfumeSizeId) => {
    setWishlistRecords((prev) =>
      prev.map((r) => (r.perfumeId === perfumeId ? { ...r, preferredSize: sizeId } : r))
    );
  };

  const handleRemoveWishlistItem = (perfumeId: string) => {
    setWishlistRecords((prev) => prev.filter((r) => r.perfumeId !== perfumeId));
  };

  const handleClearWishlist = () => {
    setWishlistRecords([]);
  };

  const handleMoveAllWishlistToBag = () => {
    const inStockEntries = wishlistEntries.filter(
      (entry) => !isSizeOutOfStock(entry.perfume, entry.preferredSize)
    );
    if (inStockEntries.length === 0) {
      showToast('Saved wishlist items are currently Stock Out');
      return;
    }
    setCart((prev) => {
      const next = [...prev];
      for (const entry of inStockEntries) {
        const idx = next.findIndex(
          (item) => item.perfume.id === entry.perfume.id && item.sizeId === entry.preferredSize
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        } else {
          next.push({ perfume: entry.perfume, sizeId: entry.preferredSize, quantity: 1 });
        }
      }
      return next;
    });
    setWishlistOpen(false);
    setBagOpen(true);
    showToast(`Added ${inStockEntries.length} saved scents to your bag`);
  };

  const floatingBannerTrack =
    '× MONEY BACK IF NOT ORIGINAL × CASH ON DELIVERY × DECANTED AFTER ORDER × 24-72HOURS DELIVERY × LEAKS & BROKEN WILL BE REPLACED ';

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#1A1612] flex flex-col">
      {/* Top Floating Assurance Banner + Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#E7DCC4] bg-[#FCFBF8]/95 backdrop-blur-md">
        <div
          aria-label="Store guarantees"
          className="h-7 overflow-hidden border-b border-[#DFCFAF] bg-gradient-to-r from-[#F9F2E1] via-[#FFFDF7] to-[#F9F2E1] flex items-center"
        >
          <div className="flex w-max animate-sillux-marquee hover:[animation-play-state:paused] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D5714] whitespace-nowrap select-none">
            <span className="shrink-0 pr-6">
              {floatingBannerTrack}
              {floatingBannerTrack}
            </span>
            <span aria-hidden="true" className="shrink-0 pr-6">
              {floatingBannerTrack}
              {floatingBannerTrack}
            </span>
          </div>
        </div>

        <div className="max-w-[1360px] mx-auto px-3 sm:px-8 h-16 flex items-center justify-between gap-2 sm:gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigateSection('hero')}
            className="font-display text-xl sm:text-2xl font-bold tracking-[0.06em] uppercase text-[#1A1612] hover:text-[#9A7228] transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] inline-flex items-center"
          >
            Sillux
          </button>

          {/* Zone 2: Concise Single-Line Navigation Buttons */}
          <nav
            className="hidden xl:flex items-center gap-1.5 text-xs tracking-wide"
            aria-label="Primary navigation"
          >
            <button
              type="button"
              onClick={() => handleNavigateSection('hero')}
              className={`px-2.5 py-1.5 border transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-[0_1px_2px_rgba(140,100,30,0.05)] ${
                activePage === 'store'
                  ? 'bg-white border-[#D6C39A] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] hover:bg-[#FBF6EA]'
                  : 'bg-[#F8F4EC] border-[#E7DCC4] text-[#5C5347] hover:border-[#B58938] hover:text-[#1A1612]'
              }`}
            >
              Sillux Home
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('trending')}
              className="px-2.5 py-1.5 bg-white border border-[#D6C39A] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] hover:bg-[#FBF6EA] shadow-[0_1px_2px_rgba(140,100,30,0.05)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Trending
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('decanting')}
              className="px-2.5 py-1.5 bg-white border border-[#D6C39A] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] hover:bg-[#FBF6EA] shadow-[0_1px_2px_rgba(140,100,30,0.05)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              How We Decant
            </button>
            <button
              type="button"
              onClick={() => openPolicyPage('authenticity')}
              className={`px-2.5 py-1.5 border transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-[0_1px_2px_rgba(140,100,30,0.05)] ${
                activePage === 'authenticity'
                  ? 'bg-[#D6B265] border-[#B58938] text-[#1A1612] font-semibold'
                  : 'bg-white border-[#D6C39A] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] hover:bg-[#FBF6EA]'
              }`}
            >
              Authenticity
            </button>
            <button
              type="button"
              onClick={() => openPolicyPage('refund')}
              className={`px-2.5 py-1.5 border transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-[0_1px_2px_rgba(140,100,30,0.05)] ${
                activePage === 'refund'
                  ? 'bg-[#D6B265] border-[#B58938] text-[#1A1612] font-semibold'
                  : 'bg-white border-[#D6C39A] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] hover:bg-[#FBF6EA]'
              }`}
            >
              Refund Policy
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('contact')}
              className="px-2.5 py-1.5 bg-white border border-[#D6C39A] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] hover:bg-[#FBF6EA] shadow-[0_1px_2px_rgba(140,100,30,0.05)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Contact
            </button>
          </nav>

          {/* Zone 3: Search + Wishlist + 3-Bar Explore Sillux Menu + Bag Action */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search fragrances"
              className="inline-flex items-center justify-center gap-1.5 min-w-[40px] min-h-[40px] px-2.5 sm:px-3 py-2 bg-white border border-[#DFD1B4] text-xs text-[#2B241D] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-[#9A7228]" />
              <span className="hidden md:inline">Search</span>
            </button>

            <button
              type="button"
              onClick={() => setWishlistOpen(true)}
              aria-label={`Open wishlist (${wishlistEntries.length} saved)`}
              className="inline-flex items-center justify-center gap-1.5 min-w-[40px] min-h-[40px] px-2 sm:px-3 py-2 bg-white border border-[#DFD1B4] text-xs text-[#2B241D] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlistEntries.length > 0 ? 'text-[#B58938] fill-[#C59B4A]' : 'text-[#9A7228]'
                }`}
              />
              <span className="hidden md:inline">Wishlist</span>
              <span className="font-mono tabular-nums text-[#8C641E] font-medium">
                ({wishlistEntries.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => openExploreWithTab('contact')}
              aria-label="Open 3-bar Explore Sillux menu"
              className="inline-flex items-center justify-center gap-1.5 min-w-[40px] min-h-[40px] px-2.5 sm:px-3 py-2 bg-white border border-[#DFD1B4] text-xs text-[#2B241D] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Menu className="w-3.5 h-3.5 text-[#9A7228]" />
              <span className="hidden sm:inline">Explore Sillux</span>
            </button>

            <button
              type="button"
              onClick={() => setBagOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 sm:px-3.5 py-2 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">Bag ({totalBagCount})</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {activePage !== 'store' ? (
          <AuthenticityRefundPage
            initialTab={activePage}
            onBackToStore={() => handleNavigateSection('hero')}
          />
        ) : (
          <>
        {/* SECTION 1: Luxury Editorial Hero */}
        <section
          id="hero"
          className="border-b border-[#E7DCC4] bg-[radial-gradient(ellipse_at_top_center,rgba(212,175,99,0.12),transparent_62%)]"
        >
          {/* Full-Screen Width Fixed Luxury Video Banner (Left Screen to Right Screen) */}
          <LuxuryVideoBanner />

          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-14 space-y-8">
            <div className="space-y-3">
              <div className="text-xs tracking-[0.18em] uppercase text-[#9A7228] font-semibold">
                Haute Parfumerie &amp; Precision Decants
              </div>

              <div>
                <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-[-0.02em] text-[#1A1612] leading-[1.06]">
                  Sillux
                </h1>
                <p className="font-display text-lg sm:text-2xl font-normal tracking-[0.01em] text-[#9A7228] mt-2 text-balance">
                  “Smelling good never goes out of style.”
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <p className="text-sm sm:text-base text-[#5C5347] leading-relaxed max-w-2xl">
                Rare niche extraits and architectural designer creations, precision-drawn into
                heavy-wall glass atomizers from 3ML to 30ML or delivered factory-sealed inside their
                full presentation coffrets. Click any perfume photograph below to inspect its full
                olfactory notes chart and select your vessel size.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 shrink-0">
                <a
                  href="#trending"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold whitespace-nowrap shadow-[0_8px_20px_-10px_rgba(26,22,18,0.35)]"
                >
                  Explore Trending
                </a>
                <a
                  href={CONTACT_INFO.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-3 bg-white border border-[#D8C59B] text-xs font-medium text-[#8C641E] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp {CONTACT_INFO.whatsappDisplay}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#E7DCC4] grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="font-mono tabular-nums text-lg font-medium text-[#1A1612]">
                  3ML – 30ML
                </div>
                <div className="text-xs text-[#6D6254] mt-1">
                  Heavy-wall glass atelier decants
                </div>
              </div>
              <div>
                <div className="font-mono tabular-nums text-lg font-medium text-[#1A1612]">
                  100ML
                </div>
                <div className="text-xs text-[#6D6254] mt-1">
                  Full bottles with presentation coffret
                </div>
              </div>
              <div>
                <div className="font-mono tabular-nums text-lg font-medium text-[#1A1612]">
                  100%
                </div>
                <div className="text-xs text-[#6D6254] mt-1">
                  Batch-verified master flacons
                </div>
              </div>
              <div>
                <a
                  href={CONTACT_INFO.telUrl}
                  className="font-mono tabular-nums text-lg font-medium text-[#8C641E] hover:text-[#1A1612] transition-colors"
                >
                  {CONTACT_INFO.phone}
                </a>
                <div className="text-xs text-[#6D6254] mt-1">
                  Direct phone &amp; WhatsApp concierge
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges Strip beneath Hero */}
        <section
          aria-label="Sillux store assurances"
          className="border-b border-[#E5D9BF] bg-[#F6F0E4]"
        >
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E2D4B7]">
              <div className="py-5 md:pr-8 flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 bg-white border border-[#D4BD8E] shadow-xs flex items-center justify-center">
                  <Lock className="w-4.5 h-4.5 text-[#9A7228]" strokeWidth={1.6} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1612]">
                    Secure Checkout
                  </div>
                  <p className="text-xs text-[#5C5347] mt-0.5">
                    Cash on Delivery, bKash &amp; Nagad supported with concierge verification
                  </p>
                </div>
              </div>

              <div className="py-5 md:px-8 flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 bg-white border border-[#D4BD8E] shadow-xs flex items-center justify-center">
                  <Truck className="w-4.5 h-4.5 text-[#9A7228]" strokeWidth={1.6} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1612]">
                    Express Shipping
                  </div>
                  <p className="text-xs text-[#5C5347] mt-0.5">
                    Cushioned temperature-safe dispatch in 24–48 hours
                  </p>
                </div>
              </div>

              <div className="py-5 md:pl-8 flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 bg-white border border-[#D4BD8E] shadow-xs flex items-center justify-center">
                  <BadgeCheck className="w-4.5 h-4.5 text-[#9A7228]" strokeWidth={1.6} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1612]">
                    Batch Guaranteed
                  </div>
                  <p className="text-xs text-[#5C5347] mt-0.5">
                    Original house batch codes &amp; undiluted authenticity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Trending Perfumes (Best Sellers Always Sorted First) */}
        <section id="trending" className="border-b border-[#E7DCC4] bg-[#FCFBF8] py-16 sm:py-20">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs tracking-[0.16em] uppercase text-[#9A7228] font-semibold">
                  Curated Spotlight
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-tight text-[#1A1612] mt-1">
                  Trending Perfumes
                </h2>
              </div>

              {/* Interactive Olfactory Family Filter Tabs */}
              <div
                className="flex items-center gap-1.5 flex-wrap"
                role="tablist"
                aria-label="Filter trending perfumes by scent family"
              >
                {FAMILY_FILTERS.map((fam) => {
                  const active = familyFilter === fam;
                  return (
                    <button
                      key={fam}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFamilyFilter(fam)}
                      className={`min-h-[40px] px-3 py-2 text-xs transition-colors cursor-pointer whitespace-nowrap border ${
                        active
                          ? 'bg-[#1A1612] text-[#FCFBF8] border-[#1A1612] font-semibold'
                          : 'bg-white text-[#5C5347] border-[#E2D6BC] hover:text-[#1A1612] hover:border-[#B58938]'
                      }`}
                    >
                      {fam}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
              {trendingPerfumes.map((perfume) => (
                <TrendingPerfumeCard
                  key={perfume.id}
                  perfume={perfume}
                  isSaved={wishlistIds.has(perfume.id)}
                  onOpenDetail={openPerfumeDetail}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>

            {/* Animated View All Best Sellers CTA directly below the last perfume */}
            <div className="mt-10 sm:mt-12 flex flex-col items-center gap-3">
              <div className="relative inline-flex">
                <span
                  aria-hidden="true"
                  className="animate-sillux-cta-halo pointer-events-none absolute -inset-1 border border-[#D6B265]/60"
                />
                <button
                  type="button"
                  onClick={handleViewAllBestSellers}
                  className="sillux-bestseller-cta group relative overflow-hidden inline-flex items-center justify-center gap-3 min-h-[48px] px-7 py-3.5 bg-[#1A1612] text-[#FCFBF8] border border-[#C59B4A] hover:bg-[#FCFBF8] hover:text-[#1A1612] hover:border-[#9A7228] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4A] text-xs sm:text-sm font-semibold tracking-wide cursor-pointer whitespace-nowrap shadow-[0_12px_28px_-12px_rgba(154,114,40,0.45)]"
                >
                  <span
                    aria-hidden="true"
                    className="animate-sillux-cta-sheen pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#E9CF8E]/45 to-transparent"
                  />
                  <span className="relative z-10">View All Best Sellers</span>
                  <ArrowRight
                    className="relative z-10 w-4 h-4 text-[#D6B265] group-hover:text-[#9A7228] transition-transform duration-200 animate-sillux-arrow-forward"
                    aria-hidden="true"
                  />
                </button>
              </div>

              {familyFilter === 'Best Sellers' && (
                <button
                  type="button"
                  onClick={() => setFamilyFilter('All')}
                  className="text-xs text-[#8C641E] hover:text-[#1A1612] underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Show all {uniqueHomePerfumes.length} perfumes
                </button>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 4: How We Decant + FAQ + Contact With Us */}
        <section id="decanting" className="py-16 sm:py-20 border-b border-[#E7DCC4] bg-[#F8F3EA]/70">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 space-y-20">
            {/* How We Decant Editorial Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              <div className="lg:col-span-6">
                <div className="h-full min-h-[300px] border border-[#DFD0B0] bg-white p-2 shadow-[0_14px_38px_-22px_rgba(120,88,30,0.2)] overflow-hidden">
                  <img
                    src="./src/assets/images/atelier_decanting_craft_1795009105859.jpg"
                    alt="Sillux decanting atelier bench with glass pipettes and master crystal flacons"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs tracking-[0.16em] uppercase text-[#9A7228] font-semibold">
                    Atelier Protocol
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-tight text-[#1A1612] mt-1">
                    How We Decant
                  </h2>
                  <p className="text-sm text-[#5C5347] mt-3 leading-relaxed">
                    Whether you select a pocket 3ML atomizer or a 30ML collector decant, every drop
                    is extracted under sterile studio conditions without oxygen exposure.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {DECANTING_STEPS.map((item) => (
                    <div key={item.step} className="space-y-1.5 border-t border-[#DFD1B4] pt-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums text-xs font-semibold text-[#9A7228]">
                          {item.step}.
                        </span>
                        <h3 className="text-sm font-semibold text-[#1A1612]">{item.title}</h3>
                      </div>
                      <p className="text-xs text-[#5C5347] leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white border border-[#DFD1B4] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-[#8C641E] font-semibold">
                      Sprays Per ML Guide
                    </span>
                    <span className="text-[11px] text-[#6D6254]">Fine-mist atelier sprayer</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PERFUME_SIZES.map((s) => (
                      <div
                        key={s.id}
                        className="p-2 bg-[#FAF6ED] border border-[#E5D8BC] text-center"
                      >
                        <div className="font-mono text-xs font-semibold text-[#1A1612]">
                          {s.id === 'FULL' ? '100ML Full' : s.shortLabel}
                        </div>
                        <div className="font-mono tabular-nums text-[11px] font-medium text-[#8C641E] mt-0.5">
                          {s.spraysEstimate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ + Contact With Us Split */}
            <div id="faq" className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
              {/* FAQ Column */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <p className="text-xs tracking-[0.16em] uppercase text-[#9A7228] font-semibold">
                    Clientele Guide
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-tight text-[#1A1612] mt-1">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="divide-y divide-[#E2D6BC] border-y border-[#E2D6BC]">
                  {FAQ_ITEMS.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={faq.q} className="py-4">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                          className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                        >
                          <span className="text-sm sm:text-base font-medium text-[#1A1612]">
                            {faq.q}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#9A7228] shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <p className="mt-3 text-xs sm:text-sm text-[#5C5347] leading-relaxed max-w-prose">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact With Us Column */}
              <div
                id="contact"
                className="lg:col-span-5 bg-white border border-[#DFD0B0] shadow-[0_14px_38px_-22px_rgba(120,88,30,0.18)] p-6 sm:p-8 flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <p className="text-xs tracking-[0.16em] uppercase text-[#9A7228] font-semibold">
                    Private Concierge
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-tight text-[#1A1612]">
                    Contact With Us
                  </h2>
                  <p className="text-sm text-[#5C5347] leading-relaxed">
                    Need help choosing between an extrait decant or a full sealed presentation
                    coffret? Reach our scent specialists directly by phone or WhatsApp.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-[#FAF6ED] border border-[#E6DAC0] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#6D6254]">Contact Phone</div>
                      <div className="font-mono tabular-nums text-lg font-medium text-[#1A1612] mt-0.5">
                        {CONTACT_INFO.phone}
                      </div>
                    </div>
                    <a
                      href={CONTACT_INFO.telUrl}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>

                  <div className="p-4 bg-[#FAF6ED] border border-[#C59B4A]/65 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium text-[#8C641E]">WhatsApp Direct</div>
                      <div className="font-mono tabular-nums text-lg font-medium text-[#1A1612] mt-0.5">
                        {CONTACT_INFO.whatsappDisplay}
                      </div>
                    </div>
                    <a
                      href={CONTACT_INFO.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 bg-[#D6B265] text-[#1A1612] hover:bg-[#C59B4A] transition-colors text-xs font-semibold whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <div className="p-4 bg-[#FAF6ED] border border-[#E6DAC0] flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-[#6D6254]">Order Alert Email</div>
                      <div className="font-mono text-sm font-medium text-[#1A1612] mt-0.5 truncate">
                        {CONTACT_INFO.email}
                      </div>
                    </div>
                    <a
                      href={CONTACT_INFO.mailtoUrl}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors text-xs font-semibold whitespace-nowrap"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#ECE2CE] flex items-center justify-between text-xs text-[#6D6254]">
                  <span>{CONTACT_INFO.hours}</span>
                  <button
                    type="button"
                    onClick={() => openExploreWithTab('contact')}
                    className="text-[#8C641E] font-medium hover:underline cursor-pointer"
                  >
                    Open Explore Menu
                  </button>
                </div>
              </div>
            </div>

            {/* Authenticity & Refund Policy Banner */}
            <div className="pt-4 border-t border-[#E2D6BC] grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-[#DFD0B0] shadow-[0_10px_28px_-20px_rgba(120,88,30,0.16)] flex flex-col justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#9A7228] font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticity Guarantee</span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold tracking-[-0.01em] leading-snug text-[#1A1612]">
                    100% Authentic Master Flacons &amp; Undiluted Decants
                  </h3>
                  <p className="text-xs text-[#5C5347] leading-relaxed">
                    Authorized provenance, verifiable batch codes prior to dispatch, and a lifetime
                    authenticity guarantee on every bottle and glass atomizer.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => openPolicyPage('authenticity')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FBF6EA] border border-[#D8C59B] text-xs font-semibold text-[#1A1612] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] transition-colors cursor-pointer"
                  >
                    <span>Read Authenticity Page</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white border border-[#DFD0B0] shadow-[0_10px_28px_-20px_rgba(120,88,30,0.16)] flex flex-col justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#9A7228] font-semibold">
                    <RotateCcw className="w-4 h-4" />
                    <span>Perfume Refund Policy</span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold tracking-[-0.01em] leading-snug text-[#1A1612]">
                    Sealed Returns, Transit Protection &amp; Rapid Claims
                  </h3>
                  <p className="text-xs text-[#5C5347] leading-relaxed">
                    7-day returns on factory-sealed 100ML presentation bottles plus 48-hour instant
                    replacement or refund coverage for any leakage or transit damage.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => openPolicyPage('refund')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FBF6EA] border border-[#D8C59B] text-xs font-semibold text-[#1A1612] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] transition-colors cursor-pointer"
                  >
                    <span>Read Refund Policy</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
          </>
        )}
      </main>

      {/* Clean Atelier Footer */}
      <footer className="bg-[#F3ECE0] border-t border-[#E2D5B8] py-10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-display text-xl font-bold tracking-[0.06em] uppercase text-[#1A1612]">Sillux</div>
            <p className="text-sm text-[#5C5347] mt-1">
              Smelling good never goes out of style.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleNavigateSection('hero')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Sillux Home</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('trending')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Trending</span>
            </button>
            <button
              type="button"
              onClick={() => openExploreWithTab('decant')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>How We Decant</span>
            </button>
            <button
              type="button"
              onClick={() => openExploreWithTab('faq')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>FAQ</span>
            </button>
            <button
              type="button"
              onClick={() => openPolicyPage('authenticity')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Authenticity</span>
            </button>
            <button
              type="button"
              onClick={() => openPolicyPage('refund')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Refund Policy</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('contact')}
              className="inline-flex items-center gap-1 min-h-[38px] px-3 py-1.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Contact</span>
            </button>
            <button
              type="button"
              onClick={() => setCookiePopupOpen(true)}
              className="inline-flex items-center gap-1 min-h-[38px] px-3 py-1.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Cookie Settings</span>
            </button>
            <span className="text-[#5C5347] font-medium pl-1 whitespace-nowrap">
              BDT (৳) · COD · bKash · Nagad
            </span>
            <span className="font-mono tabular-nums font-medium text-[#8C641E] pl-1 whitespace-nowrap">
              Tel &amp; WhatsApp: {CONTACT_INFO.phone}
            </span>
            <a
              href={CONTACT_INFO.mailtoUrl}
              className="font-mono font-medium text-[#5C5347] hover:text-[#8C641E] pl-1 whitespace-nowrap"
            >
              {CONTACT_INFO.email}
            </a>
          </div>
        </div>
      </footer>

      {/* Subtle Add-to-Bag Confirmation Toast */}
      {toastMsg && (
        <div
          className={`fixed right-4 sm:right-5 z-40 bg-white border border-[#C59B4A] px-4 py-3 text-xs font-medium text-[#1A1612] shadow-[0_14px_32px_-12px_rgba(120,88,30,0.3)] ${
            cookiePopupOpen ? 'bottom-44 sm:bottom-5' : 'bottom-5'
          }`}
        >
          {toastMsg}
        </div>
      )}

      {/* Overlays */}
      <PerfumeDetailModal
        perfume={detailState?.perfume ?? null}
        initialSize={detailState?.initialSize ?? '10ML'}
        isSaved={detailState ? wishlistIds.has(detailState.perfume.id) : false}
        getInCartCount={(perfumeId, sizeId) =>
          cart.find((item) => item.perfume.id === perfumeId && item.sizeId === sizeId)?.quantity ?? 0
        }
        onClose={() => setDetailState(null)}
        onToggleWishlist={handleToggleWishlist}
        onShopNow={handleShopNow}
        onAddToCart={handleAddToCart}
      />

      <ExploreMenuDrawer
        open={exploreOpen}
        initialTab={exploreTab}
        gmailUserEmail={gmailUserEmail}
        hasGmailToken={Boolean(gmailAccessToken)}
        isGoogleSigningIn={isGoogleSigningIn}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleLogout={handleGoogleLogout}
        onClose={() => setExploreOpen(false)}
        onNavigateSection={handleNavigateSection}
        onOpenPolicyPage={openPolicyPage}
        onOpenOrderStatus={(orderId) => openOrderTracking(orderId)}
      />

      <OrderStatusModal
        open={orderStatusOpen}
        initialOrderId={trackingOrderId}
        onClose={() => {
          setOrderStatusOpen(false);
          setTrackingOrderId(null);
        }}
      />

      <SearchOverlay
        open={searchOpen}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        onClose={() => setSearchOpen(false)}
        onViewNotes={openPerfumeDetail}
        onShopNow={handleShopNow}
      />

      <WishlistDrawer
        open={wishlistOpen}
        entries={wishlistEntries}
        onClose={() => setWishlistOpen(false)}
        onChangeSize={handleWishlistSizeChange}
        onRemove={handleRemoveWishlistItem}
        onClearAll={handleClearWishlist}
        onViewNotes={openPerfumeDetail}
        onShopNow={handleShopNow}
        onMoveAllToBag={handleMoveAllWishlistToBag}
      />

      <ShoppingBagDrawer
        open={bagOpen}
        items={cart}
        gmailUserEmail={gmailUserEmail}
        gmailAccessToken={gmailAccessToken}
        isGoogleSigningIn={isGoogleSigningIn}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleLogout={handleGoogleLogout}
        onClose={() => setBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearBag={() => setCart([])}
        onTrackOrder={(orderId) => {
          setBagOpen(false);
          openOrderTracking(orderId);
        }}
      />

      <SilluxChatbox
        cart={cart}
        onOpenPerfume={openPerfumeDetail}
        onQuickAdd10Ml={handleQuickAdd10Ml}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onOpenFullBag={() => setBagOpen(true)}
      />

      <CookieConsentPopup
        open={cookiePopupOpen}
        initialPrefs={cookiePrefs}
        onSave={(prefs) => {
          setCookiePrefs(prefs);
          setCookiePopupOpen(false);
          showToast(
            prefs.preferences
              ? 'Cookie preferences saved — wishlist & bag memory enabled'
              : 'Essential cookies only — preferences updated'
          );
        }}
        onClose={() => setCookiePopupOpen(false)}
      />
    </div>
  );
}
