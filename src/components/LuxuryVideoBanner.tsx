import React, { useEffect, useRef, useState } from 'react';
import { Film, Upload, Link2, RotateCcw, X, Check, Lock } from 'lucide-react';
import { HERO_CUSTOM_VIDEO_SRC, HERO_SHOW_TITLE_OVERLAY } from '../config/heroMedia';

interface CommercialScene {
  src: string;
  actLabel: string;
  caption: string;
  motionClass: string;
}

const COMMERCIAL_SCENES: CommercialScene[] = [
  {
    src: './src/assets/images/sillux_film_scene_one_1795011473534.jpg',
    actLabel: 'Act I · Obsidian & Amber',
    caption: 'Pure Extrait Concentration',
    motionClass: 'animate-sillux-cinema-a',
  },
  {
    src: './src/assets/images/sillux_film_scene_two_1795011473691.jpg',
    actLabel: 'Act II · Suspended Sillage',
    caption: 'Atomized Gold & Silk',
    motionClass: 'animate-sillux-cinema-b',
  },
  {
    src: './src/assets/images/sillux_cinema_banner_1795010746604.jpg',
    actLabel: 'Act III · Haute Parfumerie',
    caption: 'Crafted from 3ML to 100ML',
    motionClass: 'animate-sillux-cinema-a',
  },
];

interface MistMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  isBokeh: boolean;
  life: number;
  maxLife: number;
}

declare const __SILLUX_OWNER_DEV__: boolean;

// Compiled to literal false in production builds so live website visitors never see or access upload controls.
const IS_OWNER_DEV_MODE =
  typeof __SILLUX_OWNER_DEV__ !== 'undefined' &&
  __SILLUX_OWNER_DEV__ &&
  typeof window !== 'undefined' &&
  !window.location.hostname.endsWith('.github.io') &&
  !window.location.hostname.startsWith('ais-pre-');

/**
 * Full-bleed (left-to-right edge-to-edge) fixed luxury commercial banner.
 * Only editable by the owner inside local/AI Studio preview; production/live builds
 * ship strictly the finalized video or reel with zero visible or adjustable controls.
 */
export const LuxuryVideoBanner: React.FC = () => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [customVideoSrc, setCustomVideoSrc] = useState<string>(HERO_CUSTOM_VIDEO_SRC);
  const [showTitleOverlay, setShowTitleOverlay] = useState<boolean>(HERO_SHOW_TITLE_OVERLAY);
  const [editorOpen, setEditorOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(HERO_CUSTOM_VIDEO_SRC);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Commercial reel scene cross-dissolve loop (active when no custom video is set)
  useEffect(() => {
    if (customVideoSrc) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const timer = window.setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % COMMERCIAL_SCENES.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [customVideoSrc]);

  // 60fps floating atomizer mist droplets & warm anamorphic bokeh light orbs
  useEffect(() => {
    if (customVideoSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const spawnMote = (initial = false): MistMote => {
      const isBokeh = Math.random() < 0.18;
      return {
        x: width * Math.random(),
        y: height * (0.15 + Math.random() * 0.8),
        vx: (Math.random() - 0.3) * (isBokeh ? 0.22 : 0.55),
        vy: -0.12 - Math.random() * (isBokeh ? 0.16 : 0.34),
        radius: isBokeh ? 6 + Math.random() * 14 : 0.7 + Math.random() * 1.9,
        alpha: isBokeh ? 0.03 + Math.random() * 0.05 : 0.18 + Math.random() * 0.42,
        isBokeh,
        life: initial ? Math.random() * 200 : 0,
        maxLife: 180 + Math.random() * 200,
      };
    };

    const motes: MistMote[] = Array.from({ length: 84 }, () => spawnMote(true));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life += 1;

        if (m.life >= m.maxLife || m.x > width + 30 || m.x < -30 || m.y < -30) {
          motes[i] = spawnMote(false);
          continue;
        }

        const progress = m.life / m.maxLife;
        const fade =
          progress < 0.22 ? progress / 0.22 : 1 - (progress - 0.22) / 0.78;
        const opacity = m.alpha * fade;

        if (m.isBokeh) {
          const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
          grad.addColorStop(0, `rgba(223, 188, 130, ${(opacity * 1.35).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(223, 188, 130, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 204, 152, ${opacity.toFixed(3)})`;
          ctx.fill();
        }
      }

      if (!prefersReduced) {
        animId = window.requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animId) window.cancelAnimationFrame(animId);
    };
  }, [customVideoSrc]);

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!IS_OWNER_DEV_MODE) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
      setVideoError('Please upload an MP4, WebM, or MOV video file.');
      return;
    }
    if (file.size > 45 * 1024 * 1024) {
      setVideoError('Please choose a video file under 45 MB for fast web & GitHub loading.');
      return;
    }

    setVideoError(null);
    setStatusMessage(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/dev/hero-video', {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'X-Show-Overlay': String(showTitleOverlay),
        },
        body: file,
      });
      const data = (await res.json()) as { ok?: boolean; videoSrc?: string; error?: string };
      if (!res.ok || !data.videoSrc) {
        throw new Error(data.error || 'Could not save video.');
      }
      setCustomVideoSrc(`${data.videoSrc}?v=${Date.now()}`);
      setStatusMessage('Video saved to project and live build updated.');
      setEditorOpen(false);
    } catch (err: unknown) {
      setVideoError(err instanceof Error ? err.message : 'Failed to upload banner video.');
    } finally {
      setIsSaving(false);
      e.target.value = '';
    }
  };

  const handleApplyVideoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!IS_OWNER_DEV_MODE) return;
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setVideoError('Please paste a direct video URL (.mp4 or .webm).');
      return;
    }
    if (!/^https?:\/\/|^\.\.?\/|^\//i.test(trimmed)) {
      setVideoError('Video link must start with https://, http://, or /');
      return;
    }

    setVideoError(null);
    setStatusMessage(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/dev/hero-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: trimmed, showOverlay: showTitleOverlay }),
      });
      const data = (await res.json()) as { ok?: boolean; videoSrc?: string; error?: string };
      if (!res.ok || !data.videoSrc) {
        throw new Error(data.error || 'Could not save video URL.');
      }
      setCustomVideoSrc(data.videoSrc);
      setStatusMessage('Video link saved to live build.');
      setEditorOpen(false);
    } catch (err: unknown) {
      setVideoError(err instanceof Error ? err.message : 'Failed to save video link.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleOverlay = async (checked: boolean) => {
    setShowTitleOverlay(checked);
    if (!IS_OWNER_DEV_MODE) return;
    try {
      await fetch('/api/dev/hero-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: customVideoSrc.split('?')[0],
          showOverlay: checked,
        }),
      });
    } catch {
      // Ignore overlay toggle sync errors in dev
    }
  };

  const handleResetToDefault = async () => {
    if (!IS_OWNER_DEV_MODE) return;
    setVideoError(null);
    setStatusMessage(null);
    setIsSaving(true);
    try {
      await fetch('/api/dev/hero-video', { method: 'DELETE' });
      setCustomVideoSrc('');
      setUrlInput('');
      setShowTitleOverlay(true);
      setEditorOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const currentScene = COMMERCIAL_SCENES[sceneIndex];

  return (
    <div className="relative w-full border-y border-[#C59B4A]/65 bg-[#15110C] shadow-[0_24px_60px_-24px_rgba(145,104,35,0.24)] select-none">
      {/* Full-Width Left-to-Right Edge-to-Edge Banner Stage */}
      <div className="relative w-full h-[46vh] sm:h-[58vh] lg:h-[68vh] min-h-[270px] max-h-[680px] overflow-hidden bg-[#15110C]">
        {customVideoSrc ? (
          <video
            key={customVideoSrc}
            src={customVideoSrc}
            autoPlay
            loop
            muted
            playsInline
            onError={() =>
              setVideoError('Could not play this video link. Try uploading an MP4 or WebM file.')
            }
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <>
            {/* Cross-Dissolving Luxury Fragrance Commercial Scenes */}
            {COMMERCIAL_SCENES.map((scene, idx) => {
              const isActive = idx === sceneIndex;
              return (
                <img
                  key={scene.src}
                  src={scene.src}
                  alt=""
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out pointer-events-none ${
                    scene.motionClass
                  } ${isActive ? 'opacity-92' : 'opacity-0'}`}
                />
              );
            })}

            {/* Live Fragrance Mist & Anamorphic Bokeh Light Particles */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-95 pointer-events-none"
            />

            {/* Warm Champagne Light Sweep */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#E9C985]/28 to-transparent animate-sillux-sweep pointer-events-none" />
          </>
        )}

        {/* Cinema Vignette & Center Readability Gradient */}
        {(!customVideoSrc || showTitleOverlay) && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-[#14100B]/65 via-[#14100B]/20 to-[#14100B]/65 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14100B]/75 via-transparent to-[#14100B]/45 pointer-events-none" />
          </>
        )}

        {/* Top Anamorphic Champagne-Trimmed Matte Bar */}
        <div className="absolute top-0 inset-x-0 h-2 sm:h-3 bg-[#14100B] border-b border-[#C59B4A]/40 pointer-events-none" />

        {/* Centered Commercial Brand Title Overlay: SILLUX */}
        {(!customVideoSrc || showTitleOverlay) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <div className="flex items-center gap-3 mb-2 sm:mb-3">
              <span className="h-px w-6 sm:w-10 bg-[#DFBC76]/85" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.34em] text-[#F1D8A2] font-medium">
                Maison de Parfumerie
              </span>
              <span className="h-px w-6 sm:w-10 bg-[#DFBC76]/85" />
            </div>

            <div className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[0.24em] uppercase text-[#FFFDF9] pl-[0.24em] animate-sillux-title">
              Sillux
            </div>

            <p className="font-display text-xs sm:text-lg font-normal text-[#F0D398] mt-2 sm:mt-2.5 tracking-[0.04em]">
              Smelling good never goes out of style.
            </p>

            {!customVideoSrc && (
              <div className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.24em] text-[#F5EDE0]/85 transition-opacity duration-700">
                {currentScene.actLabel} · {currentScene.caption}
              </div>
            )}
          </div>
        )}

        {/* Bottom Anamorphic Champagne-Trimmed Matte Bar */}
        <div className="absolute bottom-0 inset-x-0 h-2 sm:h-3 bg-[#14100B] border-t border-[#C59B4A]/40 pointer-events-none" />

        {/* Owner-Only Banner Controls (ONLY mounted in local/AI Studio preview, stripped from live website builds) */}
        {IS_OWNER_DEV_MODE && (
          <div className="absolute bottom-4 right-3 sm:bottom-5 sm:right-6 z-20 flex items-center gap-2">
            {customVideoSrc && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleResetToDefault()}
                title="Revert to default Sillux reel"
                className="min-h-[38px] px-2.5 py-1.5 bg-[#14100B]/85 backdrop-blur-sm border border-[#DFBC76]/60 text-[#F5EDE0] hover:border-[#D6B265] hover:text-[#D6B265] transition-colors text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Default Reel</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setVideoError(null);
                setEditorOpen((prev) => !prev);
              }}
              aria-expanded={editorOpen}
              aria-label={customVideoSrc ? 'Owner: Change banner video' : 'Owner: Add hero video'}
              className="min-h-[38px] px-3 py-1.5 bg-white/95 backdrop-blur-sm border border-[#C59B4A] text-[#1A1612] hover:bg-[#1A1612] hover:text-[#D6B265] hover:border-[#D6B265] shadow-[0_8px_20px_-6px_rgba(20,16,11,0.5)] transition-colors text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3 h-3 text-[#9A7228]" />
              <Film className="w-3.5 h-3.5 text-[#9A7228]" />
              <span>{customVideoSrc ? 'Owner: Change Video' : 'Owner: Add Video'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Owner-Only Upload Panel (completely stripped out in live production builds) */}
      {IS_OWNER_DEV_MODE && editorOpen && (
        <div
          role="dialog"
          aria-label="Owner hero banner video manager"
          className="fixed inset-x-3 bottom-4 sm:inset-x-auto sm:bottom-auto sm:top-full sm:mt-2 sm:right-6 sm:absolute z-50 sm:z-30 w-auto sm:w-[370px] bg-white border border-[#C59B4A] shadow-[0_24px_60px_-16px_rgba(20,16,11,0.55)] p-4 space-y-3.5 text-left"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#ECE2CE] pb-2.5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#9A7228] font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Owner Preview Only</span>
              </div>
              <h3 className="font-display text-base font-bold text-[#1A1612] leading-snug">
                Set Live Hero Banner Video
              </h3>
              <p className="text-[11px] text-[#6D6254] mt-0.5">
                Hidden &amp; locked on the live public website.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              aria-label="Close video selector"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center border border-[#E5D8BC] text-[#5C5347] hover:text-[#1A1612] hover:border-[#B58938] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {statusMessage && (
            <div className="px-2.5 py-1.5 bg-[#FAF6ED] border border-[#157347]/40 text-[11px] text-[#157347] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => void handleVideoFileChange(e)}
              className="hidden"
            />
            <button
              type="button"
              disabled={isSaving}
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[42px] px-3.5 py-2 bg-[#1A1612] text-[#FCFBF8] hover:bg-[#B58938] hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving to Project...' : 'Upload Video File (MP4 / WebM)'}</span>
            </button>
          </div>

          <form onSubmit={(e) => void handleApplyVideoUrl(e)} className="space-y-2">
            <label className="block text-[11px] font-medium text-[#5C5347]">
              Or paste a direct video URL:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/sillux.mp4"
                className="flex-1 min-w-0 min-h-[38px] px-2.5 py-1.5 bg-[#FAF7F0] border border-[#DFD1B4] text-base sm:text-xs text-[#1A1612] placeholder-[#8A7E6E] focus:outline-none focus:border-[#B58938]"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[38px] px-3 py-1.5 bg-[#D6B265] border border-[#B58938] text-[#1A1612] hover:bg-[#C59B4A] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <Link2 className="w-3 h-3" />
                <span>Set</span>
              </button>
            </div>
          </form>

          <label className="flex items-center justify-between gap-2 pt-2 border-t border-[#ECE2CE] text-xs text-[#1A1612] cursor-pointer">
            <span>Show SILLUX title overlay on video</span>
            <input
              type="checkbox"
              checked={showTitleOverlay}
              onChange={(e) => void handleToggleOverlay(e.target.checked)}
              className="w-4 h-4 accent-[#9A7228] cursor-pointer"
            />
          </label>

          {videoError && (
            <p className="text-[11px] text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1.5">
              {videoError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
