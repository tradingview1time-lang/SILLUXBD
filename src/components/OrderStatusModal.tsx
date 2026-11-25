import React, { useEffect, useState } from 'react';
import {
  X,
  Search,
  PackageCheck,
  Droplets,
  Truck,
  Home,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { CONTACT_INFO, PaymentMethodId, formatBdt } from '../data/perfumes';

export const ORDERS_STORAGE_KEY = 'sillux_orders_v1';

export interface StoredOrderRecord {
  orderId: string;
  customerName: string;
  customerAddress: string;
  itemsSummary: string[];
  totalBdt?: number;
  totalUsd?: number;
  paymentMethod?: PaymentMethodId;
  paymentTrxId?: string;
  paymentSenderPhone?: string;
  createdAt: number;
}

export function loadOrdersFromStorage(): StoredOrderRecord[] {
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredOrderRecord =>
        Boolean(item) && typeof item.orderId === 'string' && Array.isArray(item.itemsSummary)
    );
  } catch {
    return [];
  }
}

export function saveOrderToStorage(record: StoredOrderRecord): void {
  try {
    const existing = loadOrdersFromStorage().filter(
      (o) => o.orderId.toUpperCase() !== record.orderId.toUpperCase()
    );
    window.localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify([record, ...existing].slice(0, 20))
    );
  } catch {
    // Ignore storage quota issues
  }
}

interface ShipmentLookupResult {
  orderId: string;
  recipient: string;
  destination: string;
  itemsSummary: string[];
  totalBdt: number;
  paymentLabel: string;
  placedDate: string;
  estimatedDelivery: string;
  courierCode: string;
  currentStepIndex: number; // 0..3
  statusHeadline: string;
  stepTimestamps: string[];
}

const SAMPLE_ORDERS: Record<string, ShipmentLookupResult> = {
  'SLX-1042': {
    orderId: 'SLX-1042',
    recipient: 'A. Rahman',
    destination: 'Gulshan 2, Dhaka',
    itemsSummary: ['LV IMAGINATION (10ML Signature Decant) x1', 'AMBER EMPIRE (5ML) x1'],
    totalBdt: 13800,
    paymentLabel: 'bKash · Paid',
    placedDate: '2 days ago',
    estimatedDelivery: 'Arriving Today · Before 7:00 PM',
    courierCode: 'SLX-EXP-88410',
    currentStepIndex: 2,
    statusHeadline: 'Out for Delivery with Sillux Courier',
    stepTimestamps: ['Completed', 'Completed', 'In Transit', 'Pending'],
  },
  'SLX-2089': {
    orderId: 'SLX-2089',
    recipient: 'N. Karim',
    destination: 'Banani, Dhaka',
    itemsSummary: ['CREED AVENTUS (100ML Full Bottle with Presentation) x1'],
    totalBdt: 34200,
    paymentLabel: 'Cash on Delivery · Settled',
    placedDate: '4 days ago',
    estimatedDelivery: 'Delivered',
    courierCode: 'SLX-EXP-77214',
    currentStepIndex: 3,
    statusHeadline: 'Delivered · Signed by Recipient',
    stepTimestamps: ['Completed', 'Completed', 'Completed', 'Delivered'],
  },
  'SLX-3150': {
    orderId: 'SLX-3150',
    recipient: 'T. Chowdhury',
    destination: 'Dhanmondi, Dhaka',
    itemsSummary: ['MARWA EXTRAIT (30ML Collector Decant) x1'],
    totalBdt: 19100,
    paymentLabel: 'Nagad · Paid',
    placedDate: 'Today',
    estimatedDelivery: 'Estimated Tomorrow · Afternoon',
    courierCode: 'SLX-EXP-91042',
    currentStepIndex: 1,
    statusHeadline: 'Atelier Sterile Extraction & Sealing',
    stepTimestamps: ['Completed', 'In Progress', 'Scheduled', 'Pending'],
  },
};

const SHIPMENT_STEPS = [
  {
    title: 'Order Confirmed',
    detail: 'Vault inventory allocated and order verified.',
    Icon: PackageCheck,
  },
  {
    title: 'Atelier Decanting & QC',
    detail: 'Sterile borosilicate extraction, PTFE sealing & batch inspection.',
    Icon: Droplets,
  },
  {
    title: 'Dispatched with Courier',
    detail: 'Temperature-safe padded parcel en route to destination.',
    Icon: Truck,
  },
  {
    title: 'Delivered',
    detail: 'Handed over to recipient in protective Sillux packaging.',
    Icon: Home,
  },
];

interface OrderStatusModalProps {
  open: boolean;
  onClose: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  open,
  onClose,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [recentOrders, setRecentOrders] = useState<StoredOrderRecord[]>([]);
  const [result, setResult] = useState<ShipmentLookupResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const stored = loadOrdersFromStorage();
      setRecentOrders(stored);
      if (stored.length > 0 && !inputCode) {
        setInputCode(stored[0].orderId);
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const lookupOrder = (rawCode: string) => {
    const normalized = rawCode.trim().toUpperCase().replace(/^#/, '');
    if (!normalized) {
      setResult(null);
      setErrorMsg('Please enter an order number (for example, SLX-1042).');
      return;
    }

    // 1. Check orders placed during current/past browser sessions
    const storedMatch = recentOrders.find(
      (o) => o.orderId.toUpperCase() === normalized
    );
    if (storedMatch) {
      const ageMinutes = Math.max(0, (Date.now() - storedMatch.createdAt) / 60000);
      const stepIdx = ageMinutes < 5 ? 0 : ageMinutes < 60 ? 1 : 2;
      const paymentLabel =
        storedMatch.paymentMethod === 'bKash' || storedMatch.paymentMethod === 'Nagad'
          ? `${storedMatch.paymentMethod}${storedMatch.paymentTrxId ? ` · ${storedMatch.paymentTrxId}` : ''}`
          : 'Cash on Delivery';
      setResult({
        orderId: storedMatch.orderId,
        recipient: storedMatch.customerName,
        destination: storedMatch.customerAddress,
        itemsSummary: storedMatch.itemsSummary,
        totalBdt: storedMatch.totalBdt ?? Math.round((storedMatch.totalUsd ?? 0) * 120),
        paymentLabel,
        placedDate: 'Just placed',
        estimatedDelivery: 'Within 24–48 Hours',
        courierCode: `SLX-EXP-${storedMatch.orderId.replace(/[^0-9]/g, '') || '5091'}`,
        currentStepIndex: stepIdx,
        statusHeadline:
          stepIdx === 0
            ? 'Order Confirmed · Queued for Atelier Preparation'
            : stepIdx === 1
            ? 'Atelier Extraction & Presentation Packing'
            : 'Dispatched with Sillux Priority Courier',
        stepTimestamps: [
          'Completed',
          stepIdx >= 1 ? (stepIdx === 1 ? 'In Progress' : 'Completed') : 'Pending',
          stepIdx >= 2 ? 'In Transit' : 'Pending',
          'Pending',
        ],
      });
      setErrorMsg(null);
      return;
    }

    // 2. Check known sample showcase dispatches
    if (SAMPLE_ORDERS[normalized]) {
      setResult(SAMPLE_ORDERS[normalized]);
      setErrorMsg(null);
      return;
    }

    // 3. No match found
    setResult(null);
    setErrorMsg(
      `No shipment record found for "${normalized}". Check your order code (e.g. SLX-1042) or contact us on WhatsApp at ${CONTACT_INFO.whatsappDisplay}.`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(inputCode);
  };

  const sampleButtons = [
    ...(recentOrders.length > 0 ? [recentOrders[0].orderId] : []),
    'SLX-1042',
    'SLX-3150',
    'SLX-2089',
  ].filter((v, idx, arr) => arr.indexOf(v) === idx);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1A1612]/48 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Track Sillux order status and shipment progress"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white border border-[#DECFA9] shadow-[0_30px_80px_-24px_rgba(26,22,18,0.35)] overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E7DCC4] bg-[#FAF6ED] shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#9A7228] font-semibold">
              Atelier Dispatch Tracker
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-[#1A1612] mt-0.5">
              Order Status &amp; Shipment Progress
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order status modal"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-[#DFD1B4] text-[#5C5347] hover:text-[#1A1612] hover:border-[#B58938] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 bg-[#FCFBF8]">
          {/* Order Number Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label
              htmlFor="sillux-order-input"
              className="block text-xs text-[#5C5347]"
            >
              Enter your Sillux order number to inspect live preparation and courier stages.
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#9A7228] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="sillux-order-input"
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g. SLX-1042"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-[#DFD1B4] text-base sm:text-sm font-mono uppercase text-[#1A1612] placeholder:normal-case placeholder:font-sans placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938]"
                />
              </div>

              <button
                type="submit"
                className="min-h-[44px] px-6 py-2.5 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Track Shipment
              </button>
            </div>

            {/* Quick Lookup Order References */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[#6D6254]">Quick lookup:</span>
              {sampleButtons.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setInputCode(code);
                    lookupOrder(code);
                  }}
                  className="px-2.5 py-1 bg-white border border-[#DFD1B4] font-mono tabular-nums text-[11px] font-medium text-[#8C641E] hover:border-[#B58938] hover:bg-[#FBF6EA] transition-colors cursor-pointer"
                >
                  {code}
                </button>
              ))}
            </div>
          </form>

          {/* Error Feedback */}
          {errorMsg && (
            <div className="p-4 bg-[#FDF4EC] border border-[#C87941]/55 flex items-start gap-3 text-xs text-[#6B3E1B]">
              <AlertCircle className="w-4 h-4 text-[#B45E25] shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Shipment Progress Display */}
          {result && (
            <div className="space-y-6 border-t border-[#E7DCC4] pt-5">
              {/* Summary Strip */}
              <div className="p-4 sm:p-5 bg-white border border-[#C59B4A]/65 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-[#8C641E] font-semibold">
                      Order {result.orderId}
                    </div>
                    <h3 className="font-display text-2xl text-[#1A1612] mt-0.5">
                      {result.statusHeadline}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="font-mono tabular-nums text-xs font-medium text-[#8C641E]">
                      {result.courierCode}
                    </div>
                    <div className="text-[11px] text-[#5C5347] mt-0.5">
                      {result.estimatedDelivery}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#ECE2CE] text-xs">
                  <div>
                    <div className="text-[#7C7162]">Recipient</div>
                    <div className="text-[#1A1612] font-medium mt-0.5">{result.recipient}</div>
                  </div>
                  <div>
                    <div className="text-[#7C7162]">Destination</div>
                    <div className="text-[#1A1612] font-medium mt-0.5">{result.destination}</div>
                  </div>
                  <div>
                    <div className="text-[#7C7162]">Payment</div>
                    <div className="text-[#1A1612] font-medium mt-0.5 truncate">
                      {result.paymentLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#7C7162]">Order Total</div>
                    <div className="font-mono tabular-nums font-semibold text-[#8C641E] mt-0.5">
                      {formatBdt(result.totalBdt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Stage Visual Progress Timeline */}
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#6D6254] font-medium">
                  Shipment Timeline
                </div>

                <div className="space-y-2.5">
                  {SHIPMENT_STEPS.map((step, idx) => {
                    const Icon = step.Icon;
                    const completed = idx < result.currentStepIndex;
                    const current = idx === result.currentStepIndex;
                    const active = completed || current;
                    const stageLabel = result.stepTimestamps[idx] ?? 'Pending';

                    return (
                      <div
                        key={step.title}
                        className={`p-3.5 border flex items-start gap-3.5 transition-colors ${
                          current
                            ? 'bg-[#FAF6ED] border-[#B58938]'
                            : completed
                            ? 'bg-white border-[#DFD1B4]'
                            : 'bg-[#F7F3EA] border-[#E8DEC8] opacity-70'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 shrink-0 flex items-center justify-center border ${
                            current
                              ? 'bg-[#D6B265] border-[#B58938] text-[#1A1612]'
                              : completed
                              ? 'bg-[#FBF6EA] border-[#C59B4A] text-[#8C641E]'
                              : 'bg-white border-[#E5D8BC] text-[#8C8070]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                active ? 'text-[#1A1612]' : 'text-[#6D6254]'
                              }`}
                            >
                              {step.title}
                            </span>
                            <span
                              className={`font-mono text-[11px] shrink-0 ${
                                current
                                  ? 'text-[#8C641E] font-semibold'
                                  : completed
                                  ? 'text-[#5C5347]'
                                  : 'text-[#8C8070]'
                              }`}
                            >
                              {stageLabel}
                            </span>
                          </div>
                          <p className="text-xs text-[#5C5347] mt-0.5 leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items + Concierge Action */}
              <div className="p-4 bg-white border border-[#E5D8BC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="text-[#7C7162]">Parcel Contents</div>
                  <div className="text-[#1A1612] font-medium">{result.itemsSummary.join(' · ')}</div>
                </div>

                <a
                  href={`${CONTACT_INFO.whatsappUrl}?text=${encodeURIComponent(
                    `Hello Sillux, I am checking on order ${result.orderId} (${result.courierCode}).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FBF6EA] border border-[#C59B4A] text-xs font-semibold text-[#8C641E] hover:bg-[#1A1612] hover:text-[#FCFBF8] hover:border-[#1A1612] transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Updates</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
