import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Droplets,
  HelpCircle,
  ChevronDown,
  Copy,
  Check,
  ArrowUpRight,
  PackageSearch,
  Mail,
} from 'lucide-react';
import { CONTACT_INFO, DECANTING_STEPS, FAQ_ITEMS, PERFUME_SIZES, formatBdt } from '../data/perfumes';
import { GoogleSignInButton } from './GoogleSignInButton';
import { StoredOrderRecord, loadOrdersFromStorage } from './OrderStatusModal';

export type ExploreTab = 'contact' | 'decant' | 'faq' | 'track';

interface ExploreMenuDrawerProps {
  open: boolean;
  initialTab?: ExploreTab;
  gmailUserEmail: string | null;
  hasGmailToken: boolean;
  isGoogleSigningIn: boolean;
  onGoogleSignIn: () => Promise<void>;
  onGoogleLogout: () => Promise<void>;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenPolicyPage: (tab: 'authenticity' | 'refund') => void;
  onOpenOrderStatus: (orderId?: string) => void;
}

export const ExploreMenuDrawer: React.FC<ExploreMenuDrawerProps> = ({
  open,
  initialTab = 'contact',
  gmailUserEmail,
  hasGmailToken,
  isGoogleSigningIn,
  onGoogleSignIn,
  onGoogleLogout,
  onClose,
  onNavigateSection,
  onOpenPolicyPage,
  onOpenOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<ExploreTab>(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryNote, setInquiryNote] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [savedOrders, setSavedOrders] = useState<StoredOrderRecord[]>([]);

  React.useEffect(() => {
    if (open) {
      setSavedOrders(loadOrdersFromStorage());
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [open, initialTab]);

  if (!open) return null;

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_INFO.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 1800);
    } catch {
      // Fallback ignored
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryNote.trim()) return;
    setInquirySent(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1A1612]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Explore Sillux menu"
    >
      {/* Backdrop click closes */}
      <div className="flex-1" onClick={onClose} />

      <aside className="w-full max-w-lg bg-[#FCFBF8] border-l border-[#DFD1B4] h-[100dvh] flex flex-col overflow-hidden shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E7DCC4] bg-white shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#9A7228] font-semibold">
              Explore Sillux
            </p>
            <h2 className="font-display text-2xl text-[#1A1612] mt-0.5">
              Atelier Concierge &amp; Craft
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Explore Sillux menu"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-[#DFD1B4] text-[#5C5347] hover:text-[#1A1612] hover:border-[#B58938] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Primary Menu Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#E7DCC4] bg-[#F7F2E8] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-3 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'contact'
                ? 'border-[#B58938] text-[#1A1612] bg-white font-semibold'
                : 'border-transparent text-[#5C5347] hover:text-[#1A1612]'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-[#9A7228] shrink-0" />
            <span>Contact Us</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('decant')}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-3 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'decant'
                ? 'border-[#B58938] text-[#1A1612] bg-white font-semibold'
                : 'border-transparent text-[#5C5347] hover:text-[#1A1612]'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-[#9A7228] shrink-0" />
            <span>How We Decant</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-3 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'faq'
                ? 'border-[#B58938] text-[#1A1612] bg-white font-semibold'
                : 'border-transparent text-[#5C5347] hover:text-[#1A1612]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#9A7228] shrink-0" />
            <span>FAQ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-3 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'track'
                ? 'border-[#B58938] text-[#1A1612] bg-white font-semibold'
                : 'border-transparent text-[#5C5347] hover:text-[#1A1612]'
            }`}
          >
            <PackageSearch className="w-3.5 h-3.5 text-[#9A7228] shrink-0" />
            <span>
              Track Orders{savedOrders.length > 0 ? ` (${savedOrders.length})` : ''}
            </span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-2xl text-[#1A1612]">
                  Contact With Us
                </h3>
                <p className="text-sm text-[#5C5347] mt-1.5 leading-relaxed">
                  Speak directly with a Sillux fragrance specialist for bespoke decant sizing,
                  presentation gift wrapping, or same-day concierge delivery.
                </p>
              </div>

              {/* Direct Call & WhatsApp Cards */}
              <div className="space-y-3">
                <div className="p-4 bg-white border border-[#E5D8BC] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-[#6D6254]">Direct Atelier Line</div>
                    <div className="font-mono tabular-nums text-lg font-medium text-[#1A1612] mt-0.5">
                      {CONTACT_INFO.phone}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 bg-[#FAF6ED] border border-[#DFD1B4] text-xs text-[#2B241D] hover:text-[#1A1612] hover:border-[#B58938] transition-colors cursor-pointer"
                    >
                      {copiedPhone ? (
                        <Check className="w-3.5 h-3.5 text-[#9A7228]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={CONTACT_INFO.telUrl}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-white border border-[#C59B4A]/65 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-[#8C641E]">
                      WhatsApp Fragrance Concierge
                    </div>
                    <div className="font-mono tabular-nums text-lg font-medium text-[#1A1612] mt-0.5">
                      {CONTACT_INFO.whatsappDisplay}
                    </div>
                  </div>
                  <a
                    href={CONTACT_INFO.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 bg-[#D6B265] text-[#1A1612] hover:bg-[#C59B4A] transition-colors text-xs font-semibold whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Bound Gmail Order Alerts Card */}
                <div className="p-4 bg-white border border-[#E5D8BC] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#8C641E]">
                        Order Alert Gmail
                      </div>
                      <div className="font-mono text-sm font-medium text-[#1A1612] mt-0.5 truncate">
                        {CONTACT_INFO.email}
                      </div>
                    </div>
                    <a
                      href={CONTACT_INFO.mailtoUrl}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-2 bg-[#FAF6ED] border border-[#DFD1B4] text-xs font-semibold text-[#1A1612] hover:border-[#B58938] transition-colors whitespace-nowrap"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#8C641E]" />
                      <span>Email</span>
                    </a>
                  </div>

                  <div className="pt-2.5 border-t border-[#ECE2CE] flex flex-wrap items-center justify-between gap-2">
                    {hasGmailToken ? (
                      <>
                        <span className="text-[11px] text-[#157347] font-medium truncate">
                          Gmail connected: {gmailUserEmail || 'Google Account'}
                        </span>
                        <button
                          type="button"
                          onClick={() => void onGoogleLogout()}
                          className="text-[11px] text-[#8C641E] hover:underline font-medium cursor-pointer"
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-[#5C5347]">
                          Connect Google to dispatch order alerts via Gmail:
                        </span>
                        <GoogleSignInButton
                          onClick={() => void onGoogleSignIn()}
                          disabled={isGoogleSigningIn}
                          label={isGoogleSigningIn ? 'Connecting...' : 'Sign in with Google'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#6D6254] flex items-center justify-between py-2 border-y border-[#E7DCC4]">
                <span>{CONTACT_INFO.studio}</span>
                <span>{CONTACT_INFO.hours}</span>
              </div>

              {/* Concierge Request Note */}
              <form onSubmit={handleInquirySubmit} className="space-y-3 pt-1">
                <div className="text-xs font-semibold text-[#1A1612]">
                  Request a Private Scent Consultation
                </div>
                {inquirySent ? (
                  <div className="p-4 bg-[#FAF6ED] border border-[#C59B4A]/65 text-sm text-[#1A1612]">
                    Thank you, {inquiryName}. Our atelier concierge will reply shortly—or message us
                    immediately on WhatsApp at{' '}
                    <span className="font-mono tabular-nums font-medium text-[#8C641E]">
                      {CONTACT_INFO.whatsappDisplay}
                    </span>
                    .
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DFD1B4] text-base sm:text-sm text-[#1A1612] placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938]"
                    />
                    <textarea
                      required
                      rows={3}
                      value={inquiryNote}
                      onChange={(e) => setInquiryNote(e.target.value)}
                      placeholder="Preferred notes, ML size (3ML–30ML or Full Bottle), or gift inquiry..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DFD1B4] text-base sm:text-sm text-[#1A1612] placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938] resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full min-h-[44px] py-2.5 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                    >
                      Send Atelier Inquiry
                    </button>
                  </>
                )}
              </form>
            </div>
          )}

          {activeTab === 'decant' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-2xl text-[#1A1612]">
                  How We Decant
                </h3>
                <p className="text-sm text-[#5C5347] mt-1.5 leading-relaxed">
                  Precision extraction preserves every top note from the master flacon into our
                  3ML, 5ML, 10ML, 15ML, and 30ML glass atomizers.
                </p>
              </div>

              <div className="space-y-4">
                {DECANTING_STEPS.map((item) => (
                  <div
                    key={item.step}
                    className="p-4 bg-white border border-[#E5D8BC] space-y-1.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono tabular-nums text-xs font-semibold text-[#9A7228]">
                        {item.step}.
                      </span>
                      <h4 className="text-sm font-semibold text-[#1A1612]">{item.title}</h4>
                    </div>
                    <p className="text-xs text-[#5C5347] leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border border-[#DFD1B4] space-y-2.5">
                <div className="text-[11px] uppercase tracking-[0.14em] text-[#8C641E] font-semibold">
                  Sprays Per ML Yield
                </div>
                <div className="grid grid-cols-3 gap-2">
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

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateSection('decanting');
                }}
                className="w-full py-2.5 bg-[#FBF6EA] border border-[#C59B4A] text-[#8C641E] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] transition-colors text-xs font-semibold cursor-pointer"
              >
                View Full Decanting Atelier on Page
              </button>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-2xl text-[#1A1612]">
                  Frequently Asked Questions
                </h3>
                <p className="text-sm text-[#5C5347] mt-1.5 leading-relaxed">
                  Everything regarding authenticity, decant longevity, and Full Bottle presentation coffrets.
                </p>
              </div>

              <div className="divide-y divide-[#E2D6BC] border-y border-[#E2D6BC]">
                {FAQ_ITEMS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={faq.q} className="py-3.5">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
                      >
                        <span className="text-sm font-medium text-[#1A1612]">{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#9A7228] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="mt-2.5 text-xs text-[#5C5347] leading-relaxed">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateSection('faq');
                }}
                className="w-full py-2.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors text-xs font-semibold cursor-pointer"
              >
                Jump to Page FAQ &amp; Support
              </button>
            </div>
          )}

          {activeTab === 'track' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-2xl text-[#1A1612]">
                  Track Orders
                </h3>
                <p className="text-sm text-[#5C5347] mt-1.5 leading-relaxed">
                  Review your placed orders, order ID numbers, and ordered fragrance details, or
                  inspect live atelier preparation and courier progress.
                </p>
              </div>

              {savedOrders.length > 0 ? (
                <div className="space-y-3">
                  {savedOrders.map((order) => {
                    const orderTotal =
                      order.totalBdt ?? Math.round((order.totalUsd ?? 0) * 120);
                    return (
                      <div
                        key={order.orderId}
                        className="p-4 bg-white border border-[#DFD1B4] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-mono tabular-nums text-xs font-semibold text-[#8C641E]">
                              Order ID: #{order.orderId}
                            </div>
                            <div className="text-[11px] text-[#6D6254] mt-0.5">
                              {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-[#FAF6ED] border border-[#E5D8BC] text-[10px] font-semibold uppercase tracking-wider text-[#1A1612] shrink-0">
                            {order.paymentMethod === 'bKash' || order.paymentMethod === 'Nagad'
                              ? order.paymentMethod
                              : 'COD'}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#ECE2CE] space-y-1 text-xs">
                          <div className="text-[#6D6254]">Product Details</div>
                          <ul className="space-y-1 text-[#1A1612] font-medium">
                            {order.itemsSummary.map((line, i) => (
                              <li key={i}>• {line}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-[#ECE2CE] flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0 text-[#5C5347] truncate">
                            {order.customerName} · {order.customerAddress}
                          </div>
                          <div className="font-mono tabular-nums font-semibold text-[#8C641E] shrink-0">
                            {formatBdt(orderTotal)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenOrderStatus(order.orderId);
                          }}
                          className="w-full min-h-[42px] px-4 py-2 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <PackageSearch className="w-3.5 h-3.5" />
                          <span>Track Order #{order.orderId}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 bg-white border border-[#E5D8BC] text-center space-y-2">
                  <p className="font-display text-xl text-[#1A1612]">
                    No recent orders saved yet
                  </p>
                  <p className="text-xs text-[#5C5347] leading-relaxed">
                    Once you place an order, your Order ID and product details will appear right
                    here for instant tracking.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrderStatus(savedOrders[0]?.orderId);
                }}
                className="w-full min-h-[44px] py-2.5 bg-[#D6B265] border border-[#B58938] text-[#1A1612] hover:bg-[#C59B4A] transition-colors text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <PackageSearch className="w-3.5 h-3.5" />
                <span>Look Up Any Order ID</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Catalog Navigation Buttons */}
        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#E2D6BC] bg-[#F5EFE3] space-y-2.5 shrink-0">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateSection('hero');
              }}
              className="group min-h-[42px] inline-flex items-center justify-center gap-1 px-2 py-2 bg-white border border-[#D8C59B] text-[11px] sm:text-xs font-medium text-[#1A1612] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Sillux Home</span>
              <ArrowUpRight className="w-3 h-3 text-[#9A7228] group-hover:text-[#D6B265] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateSection('trending');
              }}
              className="group min-h-[42px] inline-flex items-center justify-center gap-1 px-2 py-2 bg-white border border-[#D8C59B] text-[11px] sm:text-xs font-medium text-[#1A1612] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Trending</span>
              <ArrowUpRight className="w-3 h-3 text-[#9A7228] group-hover:text-[#D6B265] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateSection('contact');
              }}
              className="group min-h-[42px] inline-flex items-center justify-center gap-1 px-2 py-2 bg-white border border-[#D8C59B] text-[11px] sm:text-xs font-medium text-[#1A1612] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Contact</span>
              <ArrowUpRight className="w-3 h-3 text-[#9A7228] group-hover:text-[#D6B265] shrink-0" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOrderStatus(savedOrders[0]?.orderId);
              }}
              className="group min-h-[42px] inline-flex items-center justify-center gap-1 px-2 py-2 bg-[#D6B265] border border-[#B58938] text-[11px] sm:text-xs font-semibold text-[#1A1612] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] transition-all cursor-pointer whitespace-nowrap"
            >
              <PackageSearch className="w-3.5 h-3.5 shrink-0" />
              <span>Track Orders</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPolicyPage('authenticity');
              }}
              className="group min-h-[42px] inline-flex items-center justify-center gap-1 px-2 py-2 bg-white border border-[#DFD1B4] text-[11px] sm:text-xs font-medium text-[#1A1612] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Authenticity</span>
              <ArrowUpRight className="w-3 h-3 text-[#9A7228] group-hover:text-[#D6B265] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPolicyPage('refund');
              }}
              className="group min-h-[42px] inline-flex items-center justify-center gap-1 px-2 py-2 bg-white border border-[#DFD1B4] text-[11px] sm:text-xs font-medium text-[#1A1612] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Refund Policy</span>
              <ArrowUpRight className="w-3 h-3 text-[#9A7228] group-hover:text-[#D6B265] shrink-0" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
