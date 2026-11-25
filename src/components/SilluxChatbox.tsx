import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  ShoppingBag,
  X,
  ArrowUpRight,
  Plus,
  Minus,
  Trash2,
  RotateCcw,
  GripHorizontal,
} from 'lucide-react';
import {
  PERFUMES,
  Perfume,
  PerfumeSizeId,
  formatBdt,
  getPriceForSize,
  getStockLabel,
  isPerfumeFullyOutOfStock,
} from '../data/perfumes';
import type { CartItem } from './ShoppingBagDrawer';

interface ChatRecommendation {
  id: string;
  matchingNotes: string;
  reason: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendations?: ChatRecommendation[];
  isError?: boolean;
}

interface SilluxChatboxProps {
  cart: CartItem[];
  onOpenPerfume: (perfume: Perfume, sizeId?: PerfumeSizeId) => void;
  onQuickAdd10Ml: (perfume: Perfume) => void;
  onUpdateQty: (perfumeId: string, sizeId: PerfumeSizeId, delta: number) => void;
  onRemoveItem: (perfumeId: string, sizeId: PerfumeSizeId) => void;
  onOpenFullBag: () => void;
}

const PRESET_QUESTIONS = [
  "Explore men's fragrance",
  "Explore women's fragrance",
  'Discover niche scents',
] as const;

const LAUNCHER_SIZE = 60;
const EDGE_MARGIN = 16;

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Welcome to the Sillux Scent Concierge. Choose a style below or tell me which olfactory notes you love, and I will match you with the finest extraits and decants in our collection.',
};

export const SilluxChatbox: React.FC<SilluxChatboxProps> = ({
  cart,
  onOpenPerfume,
  onQuickAdd10Ml,
  onUpdateQty,
  onRemoveItem,
  onOpenFullBag,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCartView, setShowCartView] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPoppedIn, setHasPoppedIn] = useState(false);

  const launcherWrapRef = useRef<HTMLDivElement | null>(null);
  const coordsRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const totalBagCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + getPriceForSize(item.perfume, item.sizeId) * item.quantity,
    0
  );

  const applyCoordinates = (x: number, y: number) => {
    const maxX = Math.max(EDGE_MARGIN, window.innerWidth - LAUNCHER_SIZE - EDGE_MARGIN);
    const maxY = Math.max(EDGE_MARGIN, window.innerHeight - LAUNCHER_SIZE - EDGE_MARGIN);
    const clampedX = Math.min(Math.max(EDGE_MARGIN, x), maxX);
    const clampedY = Math.min(Math.max(EDGE_MARGIN, y), maxY);
    coordsRef.current = { x: clampedX, y: clampedY };
    const el = launcherWrapRef.current;
    if (el) {
      el.style.setProperty('--chat-x', `${clampedX}px`);
      el.style.setProperty('--chat-y', `${clampedY}px`);
    }
  };

  // Initialize floating icon in bottom-right corner and pop up smoothly
  useEffect(() => {
    const placeDefaultBottomRight = () => {
      const x = window.innerWidth - LAUNCHER_SIZE - 20;
      const y = window.innerHeight - LAUNCHER_SIZE - 22;
      applyCoordinates(x, y);
    };
    placeDefaultBottomRight();

    const timer = window.setTimeout(() => {
      setHasPoppedIn(true);
    }, 320);

    const onResize = () => {
      applyCoordinates(coordsRef.current.x, coordsRef.current.y);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Keep launcher position synced whenever it re-renders back onto screen
  useEffect(() => {
    if (!isOpen && launcherWrapRef.current) {
      launcherWrapRef.current.style.setProperty('--chat-x', `${coordsRef.current.x}px`);
      launcherWrapRef.current.style.setProperty('--chat-y', `${coordsRef.current.y}px`);
    }
  }, [isOpen, hasPoppedIn]);

  useEffect(() => {
    if (!isOpen || showCartView) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading, isOpen, showCartView]);

  const handleLauncherPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: coordsRef.current.x,
      originY: coordsRef.current.y,
      moved: false,
    };
  };

  const handleLauncherPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const state = dragStateRef.current;
    if (!state.active || state.pointerId !== e.pointerId) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    if (!state.moved && Math.hypot(dx, dy) > 6) {
      state.moved = true;
    }
    if (state.moved) {
      applyCoordinates(state.originX + dx, state.originY + dy);
    }
  };

  const handleLauncherPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const state = dragStateRef.current;
    if (!state.active || state.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const wasDragged = state.moved;
    state.active = false;
    state.pointerId = null;

    if (!wasDragged) {
      setIsOpen(true);
      setShowCartView(false);
    }
  };

  const handleEndChat = () => {
    setIsOpen(false);
    setShowCartView(false);
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setInput('');
    setIsLoading(false);
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setShowCartView(false);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const buildLocalRecommendations = (queryText: string): ChatRecommendation[] => {
      const tokens = queryText
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 3);
      return [...PERFUMES]
        .map((p) => {
          const haystack = [
            p.name,
            p.house,
            p.family,
            p.displayFamily ?? '',
            p.tagline,
            ...p.notes.top,
            ...p.notes.heart,
            ...p.notes.base,
            ...p.accords.map((a) => a.name),
          ]
            .join(' ')
            .toLowerCase();
          let score = p.isBestSeller ? 1 : 0;
          for (const tok of tokens) {
            if (haystack.includes(tok)) score += 3;
          }
          return { perfume: p, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ perfume }) => ({
          id: perfume.id,
          matchingNotes: [...perfume.notes.top.slice(0, 2), ...perfume.notes.base.slice(0, 2)].join(
            ', '
          ),
          reason: perfume.tagline,
        }));
    };

    const replyWithLocalMatches = () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: 'Here are the closest matches from our Sillux fragrance catalog based on your scent profile.',
          recommendations: buildLocalRecommendations(trimmed),
        },
      ]);
    };

    try {
      if (
        typeof window !== 'undefined' &&
        window.location.hostname.endsWith('.github.io')
      ) {
        replyWithLocalMatches();
        return;
      }

      const historyPayload = nextMessages
        .filter((m) => m.id !== 'welcome' && !m.isError)
        .slice(0, -1)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        replyWithLocalMatches();
        return;
      }

      const data = (await res.json()) as {
        reply?: string;
        recommendations?: ChatRecommendation[];
        error?: string;
      };

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text:
          data.reply ??
          'Here are the fragrances in our collection that align best with those notes.',
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      replyWithLocalMatches();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const perfumeMap = new Map(PERFUMES.map((p) => [p.id, p]));

  return (
    <>
      {/* Draggable Animated Conversation Launcher Logo (Always visible, pops up from bottom-right) */}
      {!isOpen && hasPoppedIn && (
        <div
          ref={launcherWrapRef}
          className="sillux-chat-launcher-wrap fixed top-0 left-0 z-40"
        >
          <div className="animate-sillux-chat-popup relative">
            <div className="animate-sillux-chat-float relative">
              <span
                aria-hidden="true"
                className="animate-sillux-chat-orbit pointer-events-none absolute -inset-1.5 rounded-full border border-[#D6B265]"
              />
              <button
                type="button"
                onPointerDown={handleLauncherPointerDown}
                onPointerMove={handleLauncherPointerMove}
                onPointerUp={handleLauncherPointerUp}
                onPointerCancel={handleLauncherPointerUp}
                aria-label="Open Sillux AI Scent Concierge (drag anywhere to reposition)"
                title="Drag anywhere or tap to chat"
                className="touch-none select-none group relative w-[60px] h-[60px] rounded-full bg-white border-2 border-[#C59B4A] text-[#1A1612] shadow-[0_14px_34px_-8px_rgba(140,100,30,0.45)] hover:bg-[#1A1612] hover:text-[#D6B265] hover:border-[#D6B265] transition-colors flex flex-col items-center justify-center cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4A]"
              >
                {/* Animated Conversation Emblem */}
                <svg
                  viewBox="0 0 28 28"
                  className="w-7 h-7"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 7.5C5 5.84315 6.34315 4.5 8 4.5H20C21.6569 4.5 23 5.84315 23 7.5V16.5C23 18.1569 21.6569 19.5 20 19.5H12.2L7.4 23.2C6.75 23.7 5.8 23.24 5.8 22.42V19.2C5.3 18.7 5 17.9 5 16.5V7.5Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="10.2"
                    cy="12"
                    r="1.35"
                    fill="#C59B4A"
                    className="animate-sillux-chat-dot-1"
                  />
                  <circle
                    cx="14"
                    cy="12"
                    r="1.35"
                    fill="#C59B4A"
                    className="animate-sillux-chat-dot-2"
                  />
                  <circle
                    cx="17.8"
                    cy="12"
                    r="1.35"
                    fill="#C59B4A"
                    className="animate-sillux-chat-dot-3"
                  />
                </svg>

                {/* Subtle drag affordance indicator */}
                <GripHorizontal
                  className="w-3 h-3 text-[#9A7228]/75 group-hover:text-[#D6B265] -mt-0.5"
                  aria-hidden="true"
                />
              </button>

              {totalBagCount > 0 && (
                <span className="pointer-events-none absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#1A1612] text-[#FCFBF8] border border-[#C59B4A] font-mono tabular-nums text-[10px] font-semibold flex items-center justify-center shadow-sm">
                  {totalBagCount}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Conversation Window */}
      {isOpen && (
        <section
          role="dialog"
          aria-modal="false"
          aria-label="Sillux AI Scent Concierge"
          className="animate-sillux-chat-panel fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[min(calc(100vw-24px),405px)] max-h-[min(82dvh,600px)] bg-white border border-[#C59B4A] shadow-[0_28px_72px_-18px_rgba(26,22,18,0.36)] flex flex-col overflow-hidden"
        >
          {/* Header with Mini Cart View button & Cross button beside it to end chat */}
          <div className="px-4 py-3 bg-[#FAF6ED] border-b border-[#E5D8BC] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-full bg-white border border-[#C59B4A] flex items-center justify-center text-[#1A1612]">
                <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none" aria-hidden="true">
                  <path
                    d="M5 7.5C5 5.84315 6.34315 4.5 8 4.5H20C21.6569 4.5 23 5.84315 23 7.5V16.5C23 18.1569 21.6569 19.5 20 19.5H12.2L7.4 23.2C6.75 23.7 5.8 23.24 5.8 22.42V19.2C5.3 18.7 5 17.9 5 16.5V7.5Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                  <circle cx="10.2" cy="12" r="1.35" fill="#C59B4A" />
                  <circle cx="14" cy="12" r="1.35" fill="#C59B4A" />
                  <circle cx="17.8" cy="12" r="1.35" fill="#C59B4A" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold text-[#1A1612] leading-tight truncate">
                  Sillux Scent Concierge
                </h2>
                <p className="text-[11px] text-[#8C641E] truncate">
                  {showCartView ? 'Mini Shopping Bag' : 'Note-based perfume matcher'}
                </p>
              </div>
            </div>

            {/* Top-Right Corner: Small Cart View Button + Cross Button beside it to End Chat */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowCartView((prev) => !prev)}
                aria-label={showCartView ? 'Return to AI chat' : 'View shopping cart'}
                aria-pressed={showCartView}
                title={showCartView ? 'Back to chat' : 'View cart'}
                className={`min-h-[38px] px-2.5 py-1.5 border text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  showCartView
                    ? 'bg-[#1A1612] text-[#FCFBF8] border-[#1A1612]'
                    : 'bg-white text-[#1A1612] border-[#DFCFAF] hover:border-[#B58938] hover:text-[#8C641E]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#9A7228]" />
                <span className="font-mono tabular-nums">{totalBagCount}</span>
              </button>

              <button
                type="button"
                onClick={handleEndChat}
                aria-label="End chat"
                title="End chat"
                className="min-w-[38px] min-h-[38px] flex items-center justify-center bg-white border border-[#DFCFAF] text-[#5C5347] hover:text-[#C62828] hover:border-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body: Mini Cart View OR Conversation */}
          {showCartView ? (
            <div className="flex-1 flex flex-col min-h-[280px] bg-white overflow-hidden">
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-11 h-11 mx-auto bg-[#FAF6ED] border border-[#E5D8BC] flex items-center justify-center text-[#9A7228]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <p className="font-display text-xl text-[#1A1612]">Your bag is empty</p>
                    <p className="text-xs text-[#5C5347] max-w-[240px] mx-auto">
                      Ask the Sillux concierge for scent recommendations and add decants directly to
                      your bag.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCartView(false)}
                      className="min-h-[40px] px-4 py-2 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] transition-colors text-xs font-semibold cursor-pointer"
                    >
                      Back to Fragrance Chat
                    </button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const unitPrice = getPriceForSize(item.perfume, item.sizeId);
                    return (
                      <div
                        key={`mini-${item.perfume.id}-${item.sizeId}`}
                        className="p-2.5 bg-[#FAF7F0] border border-[#E6DAC0] flex items-center gap-3"
                      >
                        <img
                          src={item.perfume.image}
                          alt={item.perfume.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover border border-[#DFD1B4] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#1A1612] truncate">
                            {item.perfume.name}
                          </div>
                          <div className="text-[11px] text-[#6D6254] flex items-center gap-1.5">
                            <span>{item.sizeId === 'FULL' ? 'Full Bottle' : item.sizeId}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-[#8C641E] font-medium">
                              {formatBdt(unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.perfume.id, item.sizeId, -1)}
                            aria-label={`Decrease ${item.perfume.name} quantity`}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-[#DFD1B4] text-[#5C5347] hover:text-[#1A1612] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-mono tabular-nums text-xs font-medium text-[#1A1612]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.perfume.id, item.sizeId, 1)}
                            aria-label={`Increase ${item.perfume.name} quantity`}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-[#DFD1B4] text-[#5C5347] hover:text-[#1A1612] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.perfume.id, item.sizeId)}
                            aria-label={`Remove ${item.perfume.name}`}
                            className="w-7 h-7 flex items-center justify-center text-[#7C7162] hover:text-[#C62828] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-3.5 border-t border-[#E5D8BC] bg-[#FAF6ED] space-y-2.5 shrink-0">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[#5C5347]">Bag Subtotal</span>
                    <span className="font-mono tabular-nums text-base font-semibold text-[#1A1612]">
                      {formatBdt(cartSubtotal)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCartView(false)}
                      className="min-h-[40px] px-3 py-2 bg-white border border-[#DFD1B4] text-[#1A1612] hover:border-[#B58938] text-xs font-medium cursor-pointer whitespace-nowrap"
                    >
                      Back to Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCartView(false);
                        onOpenFullBag();
                      }}
                      className="flex-1 min-h-[40px] px-4 py-2 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Checkout ({totalBagCount})
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-[#FCFBF8]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    } space-y-2`}
                  >
                    <div
                      className={`max-w-[88%] px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#1A1612] text-[#FCFBF8] border border-[#1A1612]'
                          : msg.isError
                            ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                            : 'bg-white text-[#2B241D] border border-[#E5D8BC] shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Matched Store Perfume Cards */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="w-full space-y-2">
                        {msg.recommendations.map((rec) => {
                          const perfume = perfumeMap.get(rec.id);
                          if (!perfume) return null;
                          const out = isPerfumeFullyOutOfStock(perfume);
                          const startPrice = getPriceForSize(perfume, '3ML');
                          return (
                            <div
                              key={`${msg.id}-rec-${perfume.id}`}
                              className="p-2.5 bg-white border border-[#DFCFAF] hover:border-[#B58938] transition-colors space-y-2 shadow-xs"
                            >
                              <div className="flex items-start gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => onOpenPerfume(perfume)}
                                  className="w-14 h-14 shrink-0 bg-[#F5EFE2] border border-[#E5D8BC] overflow-hidden cursor-pointer"
                                  aria-label={`Inspect ${perfume.name}`}
                                >
                                  <img
                                    src={perfume.image}
                                    alt={perfume.name}
                                    referrerPolicy="no-referrer"
                                    className={`w-full h-full object-cover ${
                                      out ? 'opacity-75 grayscale-[25%]' : ''
                                    }`}
                                  />
                                </button>

                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#8C641E] font-semibold truncate">
                                      {perfume.house}
                                    </span>
                                    {out ? (
                                      <span className="px-1.5 py-0.5 bg-[#C62828] text-white text-[9px] font-semibold uppercase tracking-wide shrink-0">
                                        {getStockLabel(perfume)}
                                      </span>
                                    ) : (
                                      <span className="font-mono tabular-nums text-[11px] font-semibold text-[#1A1612] shrink-0">
                                        From {formatBdt(startPrice)}
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => onOpenPerfume(perfume)}
                                    className="font-display text-base font-semibold text-[#1A1612] hover:text-[#8C641E] text-left leading-tight cursor-pointer block truncate w-full"
                                  >
                                    {perfume.name}
                                  </button>

                                  <div className="text-[10px] text-[#6D6254] truncate">
                                    Notes: {rec.matchingNotes}
                                  </div>
                                </div>
                              </div>

                              <p className="text-[11px] text-[#5C5347] leading-snug">{rec.reason}</p>

                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => onOpenPerfume(perfume)}
                                  className="flex-1 min-h-[34px] px-2.5 py-1.5 bg-[#FAF6ED] border border-[#D8C59B] text-[#1A1612] hover:border-[#9A7228] hover:text-[#8C641E] text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <span>View Notes &amp; Sizes</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>

                                {!out && (
                                  <button
                                    type="button"
                                    onClick={() => onQuickAdd10Ml(perfume)}
                                    className="min-h-[34px] px-2.5 py-1.5 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    + 10ML
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {/* 3 Preset Quick Questions */}
                <div className="space-y-1.5 pt-1" aria-label="Preset fragrance questions">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[#8C641E] font-semibold">
                      Curated Quick Prompts
                    </span>
                    {messages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMessages([INITIAL_WELCOME_MESSAGE])}
                        className="text-[10px] text-[#6D6254] hover:text-[#1A1612] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>New topic</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {PRESET_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        disabled={isLoading}
                        onClick={() => void sendMessage(q)}
                        className="w-full min-h-[38px] px-3 py-2 bg-white border border-[#DECFA9] hover:border-[#9A7228] hover:bg-[#FAF6ED] text-left text-xs font-medium text-[#1A1612] flex items-center justify-between gap-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <span>{q}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#9A7228] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5D8BC] text-xs text-[#6D6254] w-fit">
                    <span className="flex items-center gap-1" aria-hidden="true">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C59B4A] animate-sillux-chat-dot-1" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C59B4A] animate-sillux-chat-dot-2" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C59B4A] animate-sillux-chat-dot-3" />
                    </span>
                    <span>Matching notes in the Sillux vault...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSubmit}
                className="p-3 bg-white border-t border-[#E5D8BC] flex items-center gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about notes, mood, or scents..."
                  aria-label="Ask the Sillux AI Scent Concierge"
                  className="flex-1 min-w-0 min-h-[40px] px-3 py-2 bg-[#FAF7F0] border border-[#DFD1B4] text-base sm:text-xs text-[#1A1612] placeholder-[#8A7E6E] focus:outline-none focus:border-[#B58938]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="min-w-[40px] min-h-[40px] px-3 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] disabled:opacity-45 disabled:hover:bg-[#1A1612] transition-colors flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </section>
      )}
    </>
  );
};
