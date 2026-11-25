import React, { useState } from 'react';
import {
  X,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  CheckCircle2,
  Banknote,
  Smartphone,
  Copy,
  Check,
  Mail,
  Send,
  AlertCircle,
} from 'lucide-react';
import {
  CONTACT_INFO,
  DELIVERY_CHARGES_BDT,
  DeliveryZoneId,
  OrderNotificationPayload,
  PAYMENT_METHODS,
  PaymentMethodId,
  PERFUME_SIZES,
  Perfume,
  PerfumeSizeId,
  buildMailtoOrderAlertUrl,
  buildWhatsAppOrderAlertUrl,
  formatBdt,
  getPriceForSize,
} from '../data/perfumes';
import { saveOrderToStorage } from './OrderStatusModal';
import { GoogleSignInButton } from './GoogleSignInButton';

export interface CartItem {
  perfume: Perfume;
  sizeId: PerfumeSizeId;
  quantity: number;
}

interface ShoppingBagDrawerProps {
  open: boolean;
  items: CartItem[];
  gmailUserEmail: string | null;
  gmailAccessToken: string | null;
  isGoogleSigningIn: boolean;
  onGoogleSignIn: () => Promise<void>;
  onGoogleLogout: () => Promise<void>;
  onClose: () => void;
  onUpdateQty: (perfumeId: string, sizeId: PerfumeSizeId, delta: number) => void;
  onRemoveItem: (perfumeId: string, sizeId: PerfumeSizeId) => void;
  onClearBag: () => void;
}

interface ConfirmedOrderState {
  order: OrderNotificationPayload;
  autoEmailSent: boolean;
  autoWhatsAppSent: boolean;
  gmailManualSent: boolean;
  dispatchingServer: boolean;
  gmailError: string | null;
}

export const ShoppingBagDrawer: React.FC<ShoppingBagDrawerProps> = ({
  open,
  items,
  gmailUserEmail,
  gmailAccessToken,
  isGoogleSigningIn,
  onGoogleSignIn,
  onGoogleLogout,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearBag,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneId>('Dhaka');
  const [districtName, setDistrictName] = useState('Dhaka');
  const [areaOrRoadName, setAreaOrRoadName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('COD');
  const [walletSenderPhone, setWalletSenderPhone] = useState('');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [confirmedState, setConfirmedState] = useState<ConfirmedOrderState | null>(null);
  const [confirmGmailOpen, setConfirmGmailOpen] = useState(false);
  const [isSendingGmail, setIsSendingGmail] = useState(false);

  if (!open) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + getPriceForSize(item.perfume, item.sizeId) * item.quantity,
    0
  );
  const deliveryCharge = DELIVERY_CHARGES_BDT[deliveryZone];
  const totalPayable = subtotal + deliveryCharge;

  const selectedPaymentMeta =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod) ?? PAYMENT_METHODS[0];
  const isMobileWallet = paymentMethod === 'bKash' || paymentMethod === 'Nagad';

  const handleCopyWalletNumber = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_INFO.phone);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 1800);
    } catch {
      // Ignore clipboard permission restrictions
    }
  };

  const handleSelectZone = (zone: DeliveryZoneId) => {
    setDeliveryZone(zone);
    if (zone === 'Dhaka') {
      if (!districtName.trim()) {
        setDistrictName('Dhaka');
      }
    } else if (districtName.trim().toLowerCase() === 'dhaka') {
      setDistrictName('');
    }
  };

  const buildFormattedAddress = () => {
    const parts = [
      `Zone: ${deliveryZone}`,
      `District: ${districtName.trim()}`,
      `Area/Road: ${areaOrRoadName.trim()}`,
    ];
    if (houseNumber.trim()) {
      parts.push(`House: ${houseNumber.trim()}`);
    }
    return parts.join(', ');
  };

  const buildWhatsAppOrderLink = () => {
    const lines = items.map((item) => {
      const sizeObj = PERFUME_SIZES.find((s) => s.id === item.sizeId);
      const unit = getPriceForSize(item.perfume, item.sizeId);
      return `- ${item.perfume.name} (${sizeObj?.label ?? item.sizeId}) x${item.quantity} = ${formatBdt(
        unit * item.quantity
      )}`;
    });
    const paymentNote = isMobileWallet
      ? `Payment: ${paymentMethod}${paymentTrxId.trim() ? ` (TrxID: ${paymentTrxId.trim()})` : ''}`
      : 'Payment: Cash on Delivery (COD)';
    const recipientDetails: string[] = [];
    if (customerName.trim()) recipientDetails.push(`Name: ${customerName.trim()}`);
    if (customerPhone.trim()) recipientDetails.push(`Phone: ${customerPhone.trim()}`);
    if (areaOrRoadName.trim() || districtName.trim()) {
      const addrParts = [
        `Zone: ${deliveryZone}`,
        districtName.trim() ? `District: ${districtName.trim()}` : null,
        areaOrRoadName.trim() ? `Area/Road: ${areaOrRoadName.trim()}` : null,
        houseNumber.trim() ? `House: ${houseNumber.trim()}` : null,
      ].filter(Boolean);
      recipientDetails.push(`Delivery: ${addrParts.join(', ')}`);
    }
    const deliveryBlock =
      recipientDetails.length > 0 ? `\n${recipientDetails.join('\n')}` : '';
    const text = encodeURIComponent(
      `Hello Sillux Atelier, I would like to place an order:\n${lines.join('\n')}\nSubtotal: ${formatBdt(
        subtotal
      )} BDT\nDelivery Charge (${deliveryZone}): ${formatBdt(deliveryCharge)} BDT\nTotal: ${formatBdt(
        totalPayable
      )} BDT\n${paymentNote}${deliveryBlock}`
    );
    return `${CONTACT_INFO.whatsappUrl}?text=${text}`;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const code = `SLX-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = items.map((item) => {
      const sizeObj = PERFUME_SIZES.find((s) => s.id === item.sizeId);
      const unit = getPriceForSize(item.perfume, item.sizeId);
      return `${item.perfume.name} (${sizeObj?.shortLabel ?? item.sizeId}) x${item.quantity} · ${formatBdt(
        unit * item.quantity
      )}`;
    });
    const cleanTrxId = isMobileWallet ? paymentTrxId.trim().toUpperCase() : undefined;
    const cleanSender = isMobileWallet ? walletSenderPhone.trim() : undefined;
    const formattedAddress = buildFormattedAddress();

    const orderPayload: OrderNotificationPayload = {
      orderId: code,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: formattedAddress,
      deliveryZone,
      deliveryChargeBdt: deliveryCharge,
      subtotalBdt: subtotal,
      itemsSummary,
      totalBdt: totalPayable,
      paymentMethod,
      paymentTrxId: cleanTrxId,
      paymentSenderPhone: cleanSender,
      createdAtIso: new Date().toISOString(),
    };

    saveOrderToStorage({
      orderId: code,
      customerName: orderPayload.customerName,
      customerAddress: orderPayload.customerAddress,
      itemsSummary,
      totalBdt: totalPayable,
      paymentMethod,
      paymentTrxId: cleanTrxId,
      paymentSenderPhone: cleanSender,
      createdAt: Date.now(),
    });

    setConfirmedState({
      order: orderPayload,
      autoEmailSent: false,
      autoWhatsAppSent: false,
      gmailManualSent: false,
      dispatchingServer: true,
      gmailError: null,
    });
    setConfirmGmailOpen(false);
    onClearBag();

    if (
      typeof window !== 'undefined' &&
      window.location.hostname.endsWith('.github.io')
    ) {
      setConfirmedState((prev) => (prev ? { ...prev, dispatchingServer: false } : null));
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          autoEmailSent?: boolean;
          autoWhatsAppSent?: boolean;
        };
        setConfirmedState((prev) =>
          prev
            ? {
                ...prev,
                autoEmailSent: Boolean(data.autoEmailSent),
                autoWhatsAppSent: Boolean(data.autoWhatsAppSent),
                dispatchingServer: false,
              }
            : null
        );
      } else {
        setConfirmedState((prev) => (prev ? { ...prev, dispatchingServer: false } : null));
      }
    } catch {
      setConfirmedState((prev) => (prev ? { ...prev, dispatchingServer: false } : null));
    }
  };

  const handleConfirmSendGmail = async () => {
    if (!confirmedState || !gmailAccessToken || isSendingGmail) return;
    setIsSendingGmail(true);
    setConfirmedState((prev) => (prev ? { ...prev, gmailError: null } : null));

    try {
      const res = await fetch('/api/orders/notify-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gmailAccessToken}`,
        },
        body: JSON.stringify(confirmedState.order),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not send Gmail notification.');
      }
      setConfirmedState((prev) =>
        prev ? { ...prev, gmailManualSent: true, gmailError: null } : null
      );
      setConfirmGmailOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to send Gmail order alert.';
      setConfirmedState((prev) => (prev ? { ...prev, gmailError: msg } : null));
    } finally {
      setIsSendingGmail(false);
    }
  };

  const handleCloseDrawer = () => {
    setConfirmedState(null);
    setConfirmGmailOpen(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1A1612]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Sillux shopping bag"
    >
      <div className="flex-1" onClick={handleCloseDrawer} />

      <aside className="w-full max-w-md bg-[#FCFBF8] border-l border-[#DFD1B4] h-[100dvh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E7DCC4] bg-white shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#9A7228] font-semibold">
              Sillux Selection
            </p>
            <h2 className="font-display text-2xl text-[#1A1612] mt-0.5">
              Your Atelier Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Close shopping bag"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-[#DFD1B4] text-[#5C5347] hover:text-[#1A1612] hover:border-[#B58938] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {confirmedState ? (
            <div className="space-y-4">
              <div className="p-5 sm:p-6 bg-white border border-[#C59B4A] space-y-4">
                <div className="flex items-center gap-2.5 text-[#8C641E]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Order Confirmed
                  </span>
                </div>
                <h3 className="font-display text-2xl text-[#1A1612]">
                  Order #{confirmedState.order.orderId} — Preparing in Atelier
                </h3>
                <div className="p-3 bg-[#FAF6ED] border border-[#E5D8BC] text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6D6254]">Payment Method</span>
                    <span className="font-semibold text-[#1A1612]">
                      {confirmedState.order.paymentMethod === 'COD'
                        ? 'Cash on Delivery'
                        : confirmedState.order.paymentMethod}
                    </span>
                  </div>
                  {typeof confirmedState.order.subtotalBdt === 'number' && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6D6254]">Subtotal</span>
                      <span className="font-mono tabular-nums text-[#1A1612]">
                        {formatBdt(confirmedState.order.subtotalBdt)}
                      </span>
                    </div>
                  )}
                  {typeof confirmedState.order.deliveryChargeBdt === 'number' && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6D6254]">
                        Delivery Charge ({confirmedState.order.deliveryZone ?? 'Standard'})
                      </span>
                      <span className="font-mono tabular-nums text-[#1A1612]">
                        {formatBdt(confirmedState.order.deliveryChargeBdt)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6D6254]">Total</span>
                    <span className="font-mono tabular-nums font-semibold text-[#1A1612]">
                      {formatBdt(confirmedState.order.totalBdt)}
                    </span>
                  </div>
                  {confirmedState.order.paymentTrxId && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6D6254]">Transaction ID</span>
                      <span className="font-mono tabular-nums font-semibold text-[#8C641E]">
                        {confirmedState.order.paymentTrxId}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3 pt-1 border-t border-[#E5D8BC]">
                    <span className="text-[#6D6254] shrink-0">Delivery</span>
                    <span className="font-medium text-[#1A1612] text-right">
                      {confirmedState.order.customerAddress}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#5C5347] leading-relaxed">
                  Thank you, {confirmedState.order.customerName}. Your freshly decanted flacons are
                  queued for preparation. Notify our bound store channels below for immediate
                  dispatch confirmation:
                </p>

                {/* Bound WhatsApp + Gmail Notification Controls */}
                <div className="pt-3 border-t border-[#ECE2CE] space-y-3">
                  <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#8C641E]">
                    Order Notification Dispatch
                  </div>

                  {/* WhatsApp Notification (01954987111) */}
                  <div className="p-3 bg-[#FAF7F0] border border-[#E5D8BC] space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#1A1612] flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-[#8C641E]" />
                        <span>WhatsApp · {CONTACT_INFO.whatsappDisplay}</span>
                      </span>
                      {confirmedState.autoWhatsAppSent && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#157347]">
                          Dispatched
                        </span>
                      )}
                    </div>
                    <a
                      href={buildWhatsAppOrderAlertUrl(confirmedState.order)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full min-h-[42px] px-3.5 py-2 bg-[#D6B265] border border-[#B58938] text-[#1A1612] hover:bg-[#C59B4A] transition-colors text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send Order Alert to WhatsApp ({CONTACT_INFO.whatsappDisplay})</span>
                    </a>
                  </div>

                  {/* Gmail Notification (elitedrivebd1@gmail.com) */}
                  <div className="p-3 bg-[#FAF7F0] border border-[#E5D8BC] space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#1A1612] flex items-center gap-1.5 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-[#8C641E] shrink-0" />
                        <span className="truncate">Gmail · {CONTACT_INFO.email}</span>
                      </span>
                      {(confirmedState.autoEmailSent || confirmedState.gmailManualSent) && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#157347] shrink-0">
                          Sent
                        </span>
                      )}
                    </div>

                    {confirmedState.autoEmailSent || confirmedState.gmailManualSent ? (
                      <div className="px-3 py-2 bg-white border border-[#157347]/40 text-[11px] text-[#157347] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Order details sent to {CONTACT_INFO.email}</span>
                      </div>
                    ) : gmailAccessToken ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#5C5347]">
                          <span className="truncate">
                            Signed in: {gmailUserEmail || 'Google Account'}
                          </span>
                          <button
                            type="button"
                            onClick={() => void onGoogleLogout()}
                            className="text-[#8C641E] hover:underline cursor-pointer shrink-0"
                          >
                            Sign out
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConfirmGmailOpen(true)}
                          className="w-full min-h-[42px] px-3.5 py-2 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Order Email to {CONTACT_INFO.email}</span>
                        </button>
                      </div>
                    ) : typeof window !== 'undefined' &&
                      window.location.hostname.endsWith('.github.io') ? (
                      <div className="space-y-2">
                        <p className="text-[11px] text-[#5C5347] leading-relaxed">
                          Open your email client with the full order details pre-filled for{' '}
                          {CONTACT_INFO.email}:
                        </p>
                        <a
                          href={buildMailtoOrderAlertUrl(confirmedState.order)}
                          className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-[#D8C59B] text-xs font-semibold text-[#1A1612] hover:border-[#B58938] flex items-center justify-center gap-2"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#8C641E]" />
                          <span>Send Order via Email App ({CONTACT_INFO.email})</span>
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[11px] text-[#5C5347] leading-relaxed">
                          Connect Google to send this order directly via Gmail, or open your email
                          client with the order pre-filled:
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <GoogleSignInButton
                            onClick={() => void onGoogleSignIn()}
                            disabled={isGoogleSigningIn}
                            label={isGoogleSigningIn ? 'Connecting...' : 'Sign in with Google'}
                          />
                          <a
                            href={buildMailtoOrderAlertUrl(confirmedState.order)}
                            className="min-h-[40px] px-3 py-2 bg-white border border-[#D8C59B] text-[11px] font-semibold text-[#1A1612] hover:border-[#B58938] inline-flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#8C641E]" />
                            <span>Email App</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {confirmedState.gmailError && (
                      <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] text-[11px] text-[#B91C1C] flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{confirmedState.gmailError}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="w-full min-h-[44px] py-2.5 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] transition-colors text-xs font-semibold cursor-pointer"
                >
                  Continue Exploring Sillux
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="font-display text-2xl text-[#1A1612]">Your bag is empty</p>
              <p className="text-xs text-[#5C5347] max-w-xs mx-auto leading-relaxed">
                Select any 3ML, 5ML, 10ML, 15ML, 30ML decant or Full Bottle with Presentation to
                begin your collection.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const sizeObj = PERFUME_SIZES.find((s) => s.id === item.sizeId);
                const unitPrice = getPriceForSize(item.perfume, item.sizeId);
                return (
                  <div
                    key={`${item.perfume.id}-${item.sizeId}`}
                    className="p-3.5 sm:p-4 bg-white border border-[#E5D8BC] flex gap-3.5"
                  >
                    <img
                      src={item.perfume.image}
                      alt={item.perfume.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover shrink-0 border border-[#DFD1B4] bg-[#F5EFE2]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-display text-lg text-[#1A1612] leading-tight truncate">
                            {item.perfume.name}
                          </h4>
                          <p className="text-xs text-[#8C641E] font-medium mt-0.5">
                            {sizeObj?.label ?? item.sizeId}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.perfume.id, item.sizeId)}
                          aria-label={`Remove ${item.perfume.name}`}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#8C8070] hover:text-[#1A1612] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="inline-flex items-center bg-[#FAF7F0] border border-[#DFD1B4]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.perfume.id, item.sizeId, -1)}
                            aria-label="Decrease quantity"
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#5C5347] hover:text-[#1A1612] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-mono tabular-nums text-[#1A1612]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.perfume.id, item.sizeId, 1)}
                            aria-label="Increase quantity"
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#5C5347] hover:text-[#1A1612] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="font-mono tabular-nums text-sm font-medium text-[#1A1612]">
                          {formatBdt(unitPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Delivery & Payment Verification Form (COD + bKash + Nagad) */}
              <form
                id="sillux-checkout-form"
                onSubmit={(e) => void handleCheckout(e)}
                className="pt-4 space-y-4 border-t border-[#E2D6BC]"
              >
                {/* Payment Method Selector */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-[#1A1612]">
                    Select Payment Method
                  </div>

                  <div
                    className="grid grid-cols-3 gap-2"
                    role="radiogroup"
                    aria-label="Choose payment method"
                  >
                    {PAYMENT_METHODS.map((method) => {
                      const active = paymentMethod === method.id;
                      const isWallet = method.id === 'bKash' || method.id === 'Nagad';
                      return (
                        <button
                          key={method.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`min-h-[54px] px-2 py-2 border text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            active
                              ? 'bg-[#FAF6ED] border-[#B58938] text-[#1A1612] shadow-[0_2px_8px_-4px_rgba(140,100,30,0.3)]'
                              : 'bg-white border-[#DFD1B4] text-[#5C5347] hover:border-[#B58938] hover:text-[#1A1612]'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            {isWallet ? (
                              <Smartphone
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: method.accentHex }}
                              />
                            ) : (
                              <Banknote
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: method.accentHex }}
                              />
                            )}
                            <span className="text-xs font-semibold whitespace-nowrap">
                              {method.shortLabel}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#6D6254] leading-tight line-clamp-1">
                            {method.id === 'COD' ? 'Pay at door' : 'Mobile wallet'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Payment Method Instructions & Verification Inputs */}
                  <div className="p-3.5 bg-white border border-[#E5D8BC] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#1A1612]">
                        {selectedPaymentMeta.label}
                      </span>
                      {selectedPaymentMeta.walletNumber && (
                        <button
                          type="button"
                          onClick={handleCopyWalletNumber}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF6ED] border border-[#DFD1B4] text-[11px] font-mono tabular-nums text-[#8C641E] hover:border-[#B58938] transition-colors cursor-pointer"
                        >
                          <span>{selectedPaymentMeta.walletNumber}</span>
                          {copiedWallet ? (
                            <Check className="w-3 h-3 text-[#8C641E]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-[#5C5347] leading-relaxed">
                      {selectedPaymentMeta.instructions}
                    </p>

                    {isMobileWallet && (
                      <div className="space-y-2 pt-1">
                        <input
                          type="tel"
                          required
                          value={walletSenderPhone}
                          onChange={(e) => setWalletSenderPhone(e.target.value)}
                          placeholder={`Your ${paymentMethod} Number (e.g. 01XXXXXXXXX)`}
                          className="w-full px-3 py-2.5 bg-[#FCFBF8] border border-[#DFD1B4] text-base sm:text-xs text-[#1A1612] placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938]"
                        />
                        <input
                          type="text"
                          required
                          value={paymentTrxId}
                          onChange={(e) => setPaymentTrxId(e.target.value)}
                          placeholder={`${paymentMethod} Transaction ID (TrxID)`}
                          className="w-full px-3 py-2.5 bg-[#FCFBF8] border border-[#DFD1B4] text-base sm:text-xs font-mono uppercase text-[#1A1612] placeholder:normal-case placeholder:font-sans placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Recipient Details */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-[#1A1612]">
                    Delivery Recipient Details
                  </div>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DFD1B4] text-base sm:text-xs text-[#1A1612] placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938]"
                  />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contact Phone (e.g. 01954987111)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DFD1B4] text-base sm:text-xs text-[#1A1612] placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938]"
                  />

                  <div className="pt-1 space-y-2.5">
                    <div className="text-[11px] font-semibold text-[#5C5347] uppercase tracking-[0.08em]">
                      Delivery Address &amp; City
                    </div>

                    <div
                      className="grid grid-cols-2 gap-2"
                      role="radiogroup"
                      aria-label="Delivery zone"
                    >
                      {(['Dhaka', 'Outside Dhaka'] as const).map((zone) => {
                        const active = deliveryZone === zone;
                        const fee = DELIVERY_CHARGES_BDT[zone];
                        return (
                          <button
                            key={zone}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => handleSelectZone(zone)}
                            className={`min-h-[50px] px-3 py-2 border text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                              active
                                ? 'bg-[#FAF6ED] border-[#B58938] text-[#1A1612] shadow-[0_2px_8px_-4px_rgba(140,100,30,0.3)]'
                                : 'bg-white border-[#DFD1B4] text-[#5C5347] hover:border-[#B58938] hover:text-[#1A1612]'
                            }`}
                          >
                            <span className="text-xs font-semibold">{zone}</span>
                            <span className="text-[11px] font-mono tabular-nums text-[#8C641E]">
                              Delivery {formatBdt(fee)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="text"
                      required
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      placeholder="District Name (e.g. Dhaka, Chattogram, Sylhet)"
                      aria-label="District Name"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DFD1B4] text-base sm:text-xs text-[#1A1612] placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938]"
                    />
                    <input
                      type="text"
                      required
                      value={areaOrRoadName}
                      onChange={(e) => setAreaOrRoadName(e.target.value)}
                      placeholder="Area Name or Road Name"
                      aria-label="Area Name or Road Name"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DFD1B4] text-base sm:text-xs text-[#1A1612] placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938]"
                    />
                    <input
                      type="text"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      placeholder="House Number (Optional)"
                      aria-label="House Number (Optional)"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DFD1B4] text-base sm:text-xs text-[#1A1612] placeholder:text-[#8C8070] focus:outline-none focus:border-[#B58938]"
                    />
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {items.length > 0 && !confirmedState && (
          <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#E2D6BC] bg-[#F5EFE3] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs text-[#5C5347]">
              <span>Complimentary Velvet Travel Pouch</span>
              <span className="text-[#8C641E] font-medium">Included</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#5C5347]">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums text-[#1A1612] font-medium">
                {formatBdt(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#5C5347]">
              <span>Delivery Charge ({deliveryZone})</span>
              <span className="font-mono tabular-nums text-[#8C641E] font-semibold">
                {formatBdt(deliveryCharge)}
              </span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-[#1A1612] pt-1 border-t border-[#E2D6BC]">
              <span>
                Total ({paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod})
              </span>
              <span className="font-mono tabular-nums text-lg">{formatBdt(totalPayable)}</span>
            </div>

            <button
              type="submit"
              form="sillux-checkout-form"
              className="w-full min-h-[46px] py-3 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
            >
              Confirm {paymentMethod === 'COD' ? 'COD' : paymentMethod} Order ·{' '}
              {formatBdt(totalPayable)}
            </button>

            <a
              href={buildWhatsAppOrderLink()}
              target="_blank"
              rel="noreferrer"
              className="w-full min-h-[44px] py-2.5 bg-[#D6B265] border border-[#B58938] text-[#1A1612] hover:bg-[#C59B4A] transition-colors text-xs font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Order via WhatsApp ({CONTACT_INFO.whatsappDisplay})</span>
            </a>
          </div>
        )}
      </aside>

      {/* Explicit User Confirmation Dialog before Sending Email via Gmail API */}
      {confirmGmailOpen && confirmedState && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm sending Gmail order alert"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1A1612]/55 backdrop-blur-[2px]"
        >
          <div className="w-full max-w-md bg-white border border-[#C59B4A] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#9A7228] font-semibold">
                  Confirm Email Dispatch
                </p>
                <h3 className="font-display text-2xl text-[#1A1612] mt-0.5">
                  Send Order Notification via Gmail?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmGmailOpen(false)}
                aria-label="Cancel Gmail notification"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center border border-[#DFD1B4] text-[#5C5347] hover:text-[#1A1612] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-[#FAF7F0] border border-[#E5D8BC] text-xs space-y-1.5 text-[#2B241D]">
              <div>
                <span className="font-semibold text-[#1A1612]">To:</span> {CONTACT_INFO.email}
              </div>
              <div>
                <span className="font-semibold text-[#1A1612]">Order:</span> #
                {confirmedState.order.orderId} ({formatBdt(confirmedState.order.totalBdt)} BDT ·{' '}
                {confirmedState.order.paymentMethod})
              </div>
              <div>
                <span className="font-semibold text-[#1A1612]">Recipient:</span>{' '}
                {confirmedState.order.customerName} ({confirmedState.order.customerPhone})
              </div>
              <div className="pt-1 border-t border-[#E5D8BC]">
                <span className="font-semibold text-[#1A1612]">Items ({confirmedState.order.itemsSummary.length}):</span>
                <ul className="mt-1 space-y-0.5 text-[11px] text-[#5C5347]">
                  {confirmedState.order.itemsSummary.map((line, i) => (
                    <li key={i}>• {line}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-[11px] text-[#5C5347] leading-relaxed">
              This will send an email from your connected Google account ({gmailUserEmail}) to{' '}
              <span className="font-medium text-[#1A1612]">{CONTACT_INFO.email}</span>.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isSendingGmail}
                onClick={() => setConfirmGmailOpen(false)}
                className="min-h-[42px] px-4 py-2 bg-white border border-[#DFD1B4] text-xs font-medium text-[#1A1612] hover:border-[#B58938] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSendingGmail}
                onClick={() => void handleConfirmSendGmail()}
                className="min-h-[42px] px-5 py-2 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingGmail ? 'Sending...' : 'Confirm & Send Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
