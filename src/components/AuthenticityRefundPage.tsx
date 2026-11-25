import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Phone,
  MessageCircle,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import {
  AUTHENTICITY_PILLARS,
  CONTACT_INFO,
  REFUND_POLICY_ITEMS,
} from '../data/perfumes';

export type PolicyPageTab = 'authenticity' | 'refund';

interface AuthenticityRefundPageProps {
  initialTab: PolicyPageTab;
  onBackToStore: () => void;
}

export const AuthenticityRefundPage: React.FC<AuthenticityRefundPageProps> = ({
  initialTab,
  onBackToStore,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyPageTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <section
      aria-label="Sillux Authenticity and Refund Policy"
      className="border-b border-[#E7DCC4] bg-[#FCFBF8] py-12 sm:py-16"
    >
      <div className="max-w-[1160px] mx-auto px-4 sm:px-8 space-y-10">
        {/* Back Button + Page Title */}
        <div className="space-y-6">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#DFD1B4] text-xs font-medium text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#9A7228]" />
            <span>Back to Sillux Storefront</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E7DCC4] pb-8">
            <div className="space-y-2">
              <p className="text-xs tracking-[0.18em] uppercase text-[#9A7228] font-semibold">
                Maison Sillux Guarantee
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.015em] text-[#1A1612] leading-tight">
                {activeTab === 'authenticity'
                  ? 'Authenticity Guarantee'
                  : 'Perfume Refund & Return Policy'}
              </h1>
              <p className="text-sm text-[#5C5347] max-w-2xl leading-relaxed">
                {activeTab === 'authenticity'
                  ? 'Every decant and factory-sealed presentation bottle dispensed by Sillux is backed by verifiable batch provenance and pure, undiluted extraction.'
                  : 'Transparent protection for factory-sealed 100ML presentation bottles, bespoke 3ML–30ML glass decants, and transit-damaged dispatches.'}
              </p>
            </div>

            {/* Interactive Policy Page Tabs */}
            <div
              className="grid grid-cols-2 border border-[#DFD1B4] bg-white shrink-0"
              role="tablist"
              aria-label="Switch between Authenticity and Refund Policy"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'authenticity'}
                onClick={() => setActiveTab('authenticity')}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'authenticity'
                    ? 'bg-[#D6B265] text-[#1A1612] font-semibold'
                    : 'text-[#5C5347] hover:text-[#1A1612]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authenticity</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'refund'}
                onClick={() => setActiveTab('refund')}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border-l border-[#DFD1B4] ${
                  activeTab === 'refund'
                    ? 'bg-[#D6B265] text-[#1A1612] font-semibold'
                    : 'text-[#5C5347] hover:text-[#1A1612]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refund Policy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'authenticity' ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AUTHENTICITY_PILLARS.map((pillar) => (
                <article
                  key={pillar.code}
                  className="p-6 sm:p-7 bg-white border border-[#E5D8BC] shadow-[0_10px_26px_-20px_rgba(120,88,30,0.16)] space-y-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono tabular-nums text-xs font-semibold text-[#9A7228]">
                      {pillar.code}.
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-[#9A7228]" />
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold tracking-[-0.01em] text-[#1A1612]">{pillar.title}</h2>
                  <p className="text-sm text-[#5C5347] leading-relaxed">{pillar.detail}</p>
                </article>
              ))}
            </div>

            {/* Batch Code Request Box */}
            <div className="p-6 sm:p-8 bg-[#FAF6ED] border border-[#C59B4A]/65 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs uppercase tracking-[0.16em] text-[#8C641E] font-semibold">
                  Pre-Dispatch Verification
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#1A1612]">
                  Request Your Bottle Batch Code Before Shipping
                </h3>
                <p className="text-xs sm:text-sm text-[#5C5347] leading-relaxed">
                  Want to verify the CheckFresh / batch stamp of the exact master bottle your
                  decant is drawn from or inspect a sealed 100ML box? Reach our specialists anytime.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href={`${CONTACT_INFO.whatsappUrl}?text=${encodeURIComponent(
                    'Hello Sillux, I would like to verify a perfume batch code before placing my order.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#D6B265] text-[#1A1612] hover:bg-[#C59B4A] transition-colors text-xs font-semibold whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Verify via WhatsApp · {CONTACT_INFO.whatsappDisplay}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setActiveTab('refund')}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-[#DFD1B4] text-xs font-medium text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#9A7228]" />
                  <span>View Refund Policy</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {REFUND_POLICY_ITEMS.map((item) => (
                <article
                  key={item.code}
                  className="p-6 sm:p-7 bg-white border border-[#E5D8BC] shadow-[0_10px_26px_-20px_rgba(120,88,30,0.16)] space-y-3"
                >
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="font-mono tabular-nums font-semibold text-[#9A7228]">
                      {item.code}.
                    </span>
                    <span className="font-mono font-medium text-[#8C641E]">{item.window}</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold tracking-[-0.01em] text-[#1A1612]">{item.category}</h2>
                  <p className="text-sm text-[#5C5347] leading-relaxed">{item.detail}</p>
                </article>
              ))}
            </div>

            {/* How to Initiate a Return / Claim */}
            <div className="p-6 sm:p-8 bg-[#FAF6ED] border border-[#C59B4A]/65 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs uppercase tracking-[0.16em] text-[#8C641E] font-semibold">
                  Concierge Claims Desk
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#1A1612]">
                  Need to Start a Return or Report Transit Damage?
                </h3>
                <p className="text-xs sm:text-sm text-[#5C5347] leading-relaxed">
                  Share your order reference and a brief unboxing photo on WhatsApp or call our
                  direct line. Approved replacements ship out the very next dispatch cycle.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href={`${CONTACT_INFO.whatsappUrl}?text=${encodeURIComponent(
                    'Hello Sillux, I would like assistance with a perfume return or refund claim.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#D6B265] text-[#1A1612] hover:bg-[#C59B4A] transition-colors text-xs font-semibold whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp · {CONTACT_INFO.whatsappDisplay}</span>
                </a>

                <a
                  href={CONTACT_INFO.telUrl}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {CONTACT_INFO.phone}</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveTab('authenticity')}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-[#DFD1B4] text-xs font-medium text-[#1A1612] hover:border-[#B58938] hover:text-[#8C641E] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9A7228]" />
                  <span>View Authenticity Page</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
