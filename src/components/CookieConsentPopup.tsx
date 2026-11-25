import React, { useState } from 'react';
import { Cookie, SlidersHorizontal, Check, X } from 'lucide-react';

export const COOKIE_CONSENT_STORAGE_KEY = 'sillux_cookie_consent_v1';

export interface CookiePreferences {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  decidedAt: number;
}

export function loadCookieConsent(): CookiePreferences | null {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      essential: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      decidedAt: typeof parsed.decidedAt === 'number' ? parsed.decidedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(prefs: CookiePreferences): void {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota errors
  }
}

interface CookieConsentPopupProps {
  open: boolean;
  initialPrefs?: CookiePreferences | null;
  onSave: (prefs: CookiePreferences) => void;
  onClose: () => void;
}

export const CookieConsentPopup: React.FC<CookieConsentPopupProps> = ({
  open,
  initialPrefs,
  onSave,
  onClose,
}) => {
  const [showCustomize, setShowCustomize] = useState(false);
  const [allowPreferences, setAllowPreferences] = useState(
    initialPrefs ? initialPrefs.preferences : true
  );
  const [allowAnalytics, setAllowAnalytics] = useState(
    initialPrefs ? initialPrefs.analytics : true
  );

  if (!open) return null;

  const handleAllowAll = () => {
    const next: CookiePreferences = {
      essential: true,
      preferences: true,
      analytics: true,
      decidedAt: Date.now(),
    };
    saveCookieConsent(next);
    onSave(next);
  };

  const handleEssentialOnly = () => {
    const next: CookiePreferences = {
      essential: true,
      preferences: false,
      analytics: false,
      decidedAt: Date.now(),
    };
    saveCookieConsent(next);
    onSave(next);
  };

  const handleSaveCustom = () => {
    const next: CookiePreferences = {
      essential: true,
      preferences: allowPreferences,
      analytics: allowAnalytics,
      decidedAt: Date.now(),
    };
    saveCookieConsent(next);
    onSave(next);
  };

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Sillux cookie preferences"
      className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-full sm:max-w-md z-50 bg-white border border-[#C59B4A] shadow-[0_24px_60px_-16px_rgba(26,22,18,0.28)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 bg-[#FAF6ED] border border-[#D4BD8E] flex items-center justify-center">
              <Cookie className="w-4 h-4 text-[#9A7228]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#9A7228] font-semibold">
                Maison Sillux Privacy
              </p>
              <h2 className="font-display text-xl text-[#1A1612] leading-tight">
                Allow Cookies on Sillux
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss cookie notice"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center border border-[#E6DAC0] text-[#5C5347] hover:text-[#1A1612] hover:border-[#B58938] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#5C5347] leading-relaxed">
          We use essential cookies and browser storage to preserve your shopping bag, saved
          wishlist fragrances, order tracking, and currency formatting across visits.
        </p>

        {/* Expandable Preferences */}
        {showCustomize && (
          <div className="p-3.5 bg-[#FAF6ED] border border-[#E5D8BC] space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-[#1A1612]">Essential Bag &amp; Checkout</div>
                <div className="text-[11px] text-[#6D6254]">
                  Required for cart, COD / bKash / Nagad checkout &amp; order lookup
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-[#8C641E] shrink-0">
                Always On
              </span>
            </div>

            <label className="flex items-center justify-between gap-3 pt-2 border-t border-[#E6DAC0] cursor-pointer min-h-[40px]">
              <div>
                <div className="font-semibold text-[#1A1612]">Wishlist &amp; ML Memory</div>
                <div className="text-[11px] text-[#6D6254]">
                  Remembers your saved fragrances and preferred ML sizes
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowPreferences}
                onChange={(e) => setAllowPreferences(e.target.checked)}
                className="w-4 h-4 accent-[#9A7228] cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between gap-3 pt-2 border-t border-[#E6DAC0] cursor-pointer min-h-[40px]">
              <div>
                <div className="font-semibold text-[#1A1612]">Collection Analytics</div>
                <div className="text-[11px] text-[#6D6254]">
                  Helps prioritize restocks of trending extraits
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowAnalytics}
                onChange={(e) => setAllowAnalytics(e.target.checked)}
                className="w-4 h-4 accent-[#9A7228] cursor-pointer shrink-0"
              />
            </label>
          </div>
        )}

        {/* Touch-friendly Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleAllowAll}
            className="flex-1 min-h-[44px] px-4 py-2.5 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Allow Cookies</span>
          </button>

          {showCustomize ? (
            <button
              type="button"
              onClick={handleSaveCustom}
              className="min-h-[44px] px-4 py-2.5 bg-[#D6B265] border border-[#B58938] text-[#1A1612] hover:bg-[#C59B4A] transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              Save Preferences
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="min-h-[44px] px-4 py-2.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors text-xs font-medium cursor-pointer whitespace-nowrap"
            >
              Essential Only
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCustomize((prev) => !prev)}
            className="min-h-[44px] px-3 py-2.5 bg-[#FAF6ED] border border-[#DFD1B4] text-[#8C641E] hover:border-[#B58938] transition-colors text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showCustomize ? 'Hide' : 'Manage'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
