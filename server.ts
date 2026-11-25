import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import {
  CONTACT_INFO,
  OrderNotificationPayload,
  PERFUMES,
  buildMailtoOrderAlertUrl,
  buildWhatsAppOrderAlertUrl,
  formatBdt,
  formatOrderAlertBody,
  getPriceForSize,
  getStockLabel,
  isPerfumeFullyOutOfStock,
} from './src/data/perfumes.ts';

interface ChatHistoryTurn {
  role: 'user' | 'assistant';
  text: string;
}

interface GeminiRecommendationPayload {
  reply?: string;
  recommendations?: Array<{
    id?: string;
    matchingNotes?: string;
    reason?: string;
  }>;
}

const CATALOG_CONTEXT = PERFUMES.map((p) => {
  const startPrice = formatBdt(getPriceForSize(p, '3ML'));
  const price10Ml = formatBdt(getPriceForSize(p, '10ML'));
  const outOfStock = isPerfumeFullyOutOfStock(p);
  return {
    id: p.id,
    name: p.name,
    house: p.house,
    family: p.family,
    displayFamily: p.displayFamily ?? p.family,
    concentration: p.concentration,
    isBestSeller: p.isBestSeller,
    availability: outOfStock
      ? getStockLabel(p)
      : p.outOfStockSizes?.length
        ? `In stock (except ${p.outOfStockSizes.join(', ')})`
        : 'In stock (3ML–Full Bottle)',
    priceRangeBdt: `3ML from ${startPrice} · 10ML ${price10Ml} · Full ${formatBdt(p.fullPriceBdt)}`,
    longevity: p.longevity,
    sillage: p.sillage,
    tagline: p.tagline,
    notes: p.notes,
    topAccords: p.accords.map((a) => `${a.name} (${a.strength}%)`),
  };
});

const SYSTEM_INSTRUCTION = `You are the Sillux Luxury Scent Concierge for Sillux ("Smelling good never goes out of style."), a luxury niche perfume and precision decant storefront using Bangladeshi Taka (BDT / ৳).

Your job:
1. Recommend the BEST matching perfumes ONLY from the Sillux catalog provided below, strictly reasoning from each fragrance's Top Notes, Heart Notes, Base Notes, and Accords.
2. When the customer clicks or asks:
   - "Explore men's fragrance": Recommend 2–3 standout masculine/unisex powerhouses from the catalog (e.g., CREED AVENTUS, OMBRE NOMADE, BLEU DE CHANEL PARFUM, HACIVAT, OUD FOR GREATNESS, TUSCAN LEATHER, OMBRÉ LEATHER PARFUM, or LAYTON) and highlight their defining notes (e.g., smoky birch, pineapple, bergamot, Assam oud, sandalwood, cedar, or leather). Mention stock availability honestly if a recommended icon like CREED AVENTUS is currently Sold Out, and pair it with an in-stock alternative.
   - "Explore women's fragrance": Recommend 2–3 refined feminine/unisex florals, gourmands, and airy luminous scents from the catalog (e.g., DELINA EXCLUSIF, BACCARAT ROUGE 540, PACIFIC CHILL, GRAND SOIR, GRIS CHARNEL EXTRAIT, MARWA EXTRAIT, or ANGELS' SHARE) and highlight their exact notes (Turkish rose, lychee, saffron, jasmine, fig, vanilla, white floral, or amber).
   - "Discover niche scents": Recommend 2–3 distinctive artisanal/niche extraits from the catalog (e.g., AMBER EMPIRE, MARWA EXTRAIT, XJ 1861 NAXOS, ANGELS' SHARE, GRIS CHARNEL EXTRAIT, HALFETI, BLACK AFGANO, or BACCARAT ROUGE 540) explaining their complex note architecture.
3. For any custom question about notes, mood, season, weather, or budget in BDT, match directly against the catalog's notes, accords, longevity, and prices.
4. Keep your conversational reply warm, refined, concise (2–4 sentences), and cite specific Top/Heart/Base notes.
5. Always return 2 to 3 valid perfume IDs in "recommendations" using the exact "id" values from the catalog. Do NOT invent perfumes or IDs outside the catalog.

Sillux Perfume Catalog (JSON):
${JSON.stringify(CATALOG_CONTEXT)}`;

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', async (req, res) => {
    try {
      const body = req.body as {
        message?: string;
        history?: ChatHistoryTurn[];
      };

      const userMessage = typeof body?.message === 'string' ? body.message.trim() : '';
      if (!userMessage) {
        res.status(400).json({ error: 'Please enter a fragrance question or choose a prompt.' });
        return;
      }

      const history = Array.isArray(body?.history) ? body.history.slice(-8) : [];
      const historyTranscript =
        history.length > 0
          ? `Recent conversation:\n${history
              .map((h) => `${h.role === 'user' ? 'Customer' : 'Concierge'}: ${h.text}`)
              .join('\n')}\n\nCustomer's latest message: ${userMessage}`
          : userMessage;

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: historyTranscript,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description:
                  'Concise, refined concierge answer (2-4 sentences) mentioning specific olfactory notes and why these matches suit the customer.',
              },
              recommendations: {
                type: Type.ARRAY,
                description: '2 to 3 best matching perfume IDs from the Sillux catalog.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: {
                      type: Type.STRING,
                      description: 'Exact perfume id from the Sillux Perfume Catalog.',
                    },
                    matchingNotes: {
                      type: Type.STRING,
                      description: '3-5 key matching notes separated by · (e.g., Bergamot · Black Tea · Ambroxan).',
                    },
                    reason: {
                      type: Type.STRING,
                      description: 'Short 1-sentence reason why this perfume fits based on its notes.',
                    },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      let parsed: GeminiRecommendationPayload = {};
      try {
        parsed = JSON.parse(rawText) as GeminiRecommendationPayload;
      } catch {
        parsed = { reply: rawText || 'Here are the closest matches from our vault.', recommendations: [] };
      }

      const catalogMap = new Map(PERFUMES.map((p) => [p.id, p]));
      const seenIds = new Set<string>();
      const validRecommendations = (parsed.recommendations ?? [])
        .filter((rec) => {
          if (!rec?.id || !catalogMap.has(rec.id) || seenIds.has(rec.id)) return false;
          seenIds.add(rec.id);
          return true;
        })
        .slice(0, 3)
        .map((rec) => {
          const perfume = catalogMap.get(rec.id as string)!;
          return {
            id: perfume.id,
            matchingNotes:
              rec.matchingNotes?.trim() ||
              [...perfume.notes.top.slice(0, 2), perfume.notes.base[0]].filter(Boolean).join(' · '),
            reason: rec.reason?.trim() || perfume.tagline,
          };
        });

      res.json({
        reply:
          parsed.reply?.trim() ||
          'Based on the olfactory profile you asked for, here are the closest matches from the Sillux collection.',
        recommendations: validRecommendations,
      });
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      const statusCode =
        typeof errorObj?.status === 'number' && errorObj.status >= 400 && errorObj.status < 600
          ? errorObj.status
          : 500;
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to reach the Sillux AI Scent Concierge right now. Please try again.';
      res.status(statusCode).json({ error: message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const body = req.body as Partial<OrderNotificationPayload>;
      if (
        !body?.orderId ||
        !body?.customerName ||
        !body?.customerPhone ||
        !body?.customerAddress ||
        !Array.isArray(body?.itemsSummary) ||
        body.itemsSummary.length === 0 ||
        typeof body.totalBdt !== 'number'
      ) {
        res.status(400).json({ error: 'Incomplete order details.' });
        return;
      }

      const order: OrderNotificationPayload = {
        orderId: String(body.orderId),
        customerName: String(body.customerName).trim(),
        customerPhone: String(body.customerPhone).trim(),
        customerAddress: String(body.customerAddress).trim(),
        itemsSummary: body.itemsSummary.map(String),
        totalBdt: Number(body.totalBdt),
        paymentMethod: body.paymentMethod ?? 'COD',
        paymentTrxId: body.paymentTrxId ? String(body.paymentTrxId).trim() : undefined,
        paymentSenderPhone: body.paymentSenderPhone
          ? String(body.paymentSenderPhone).trim()
          : undefined,
        createdAtIso: body.createdAtIso ?? new Date().toISOString(),
      };

      const alertBody = formatOrderAlertBody(order);
      const subject = `New Sillux Order #${order.orderId} · ${order.customerName} (${formatBdt(
        order.totalBdt
      )} BDT)`;

      let autoEmailSent = false;
      let autoWhatsAppSent = false;

      // Optional unattended server email dispatch if RESEND_API_KEY is configured in environment
      const resendKey = process.env.RESEND_API_KEY?.trim();
      if (resendKey) {
        try {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL?.trim() || 'Sillux Orders <orders@resend.dev>',
              to: [CONTACT_INFO.email],
              subject,
              text: alertBody,
            }),
          });
          autoEmailSent = emailRes.ok;
        } catch {
          autoEmailSent = false;
        }
      }

      // Optional unattended WhatsApp Cloud API dispatch to 8801954987111 if configured
      const waToken = process.env.WHATSAPP_CLOUD_TOKEN?.trim();
      const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
      if (waToken && waPhoneId) {
        try {
          const waRes = await fetch(
            `https://graph.facebook.com/v21.0/${encodeURIComponent(waPhoneId)}/messages`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${waToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: CONTACT_INFO.whatsappInternational,
                type: 'text',
                text: { body: alertBody },
              }),
            }
          );
          autoWhatsAppSent = waRes.ok;
        } catch {
          autoWhatsAppSent = false;
        }
      }

      // Optional automation webhook relay (e.g. Zapier / Make / Google Apps Script for Gmail + WhatsApp)
      const webhookUrl = process.env.ORDER_WEBHOOK_URL?.trim();
      if (webhookUrl) {
        try {
          const hookRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetEmail: CONTACT_INFO.email,
              targetWhatsApp: CONTACT_INFO.whatsappInternational,
              subject,
              text: alertBody,
              order,
            }),
          });
          if (hookRes.ok) {
            autoEmailSent = true;
          }
        } catch {
          // Ignore webhook relay network failures
        }
      }

      res.json({
        ok: true,
        orderId: order.orderId,
        boundEmail: CONTACT_INFO.email,
        boundWhatsApp: CONTACT_INFO.whatsappDisplay,
        autoEmailSent,
        autoWhatsAppSent,
        whatsappAlertUrl: buildWhatsAppOrderAlertUrl(order),
        mailtoAlertUrl: buildMailtoOrderAlertUrl(order),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to record order.';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/auth-config', (_req, res) => {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() || null;
    res.json({
      configured: Boolean(clientId),
      googleOAuthClientId: clientId,
    });
  });

  app.post('/api/orders/notify-gmail', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Google sign-in is required to send via Gmail.' });
        return;
      }

      const order = req.body as Partial<OrderNotificationPayload>;
      if (
        !order?.orderId ||
        !order?.customerName ||
        !order?.customerPhone ||
        !order?.customerAddress ||
        !Array.isArray(order?.itemsSummary) ||
        typeof order.totalBdt !== 'number'
      ) {
        res.status(400).json({ error: 'Incomplete order payload for Gmail alert.' });
        return;
      }

      const normalizedOrder: OrderNotificationPayload = {
        orderId: String(order.orderId),
        customerName: String(order.customerName),
        customerPhone: String(order.customerPhone),
        customerAddress: String(order.customerAddress),
        itemsSummary: order.itemsSummary.map(String),
        totalBdt: Number(order.totalBdt),
        paymentMethod: order.paymentMethod ?? 'COD',
        paymentTrxId: order.paymentTrxId,
        paymentSenderPhone: order.paymentSenderPhone,
        createdAtIso: order.createdAtIso ?? new Date().toISOString(),
      };

      const subject = `New Sillux Order #${normalizedOrder.orderId} · ${normalizedOrder.customerName} (${formatBdt(
        normalizedOrder.totalBdt
      )} BDT)`;
      const bodyText = formatOrderAlertBody(normalizedOrder);

      const mimeLines = [
        `To: ${CONTACT_INFO.email}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset="UTF-8"',
        'Content-Transfer-Encoding: 8bit',
        '',
        bodyText,
      ];
      const raw = Buffer.from(mimeLines.join('\r\n'), 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const gmailRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw }),
        }
      );

      const gmailJson = (await gmailRes.json()) as {
        id?: string;
        error?: { message?: string };
      };

      if (!gmailRes.ok) {
        res.status(gmailRes.status).json({
          error:
            gmailJson?.error?.message ||
            'Gmail could not send this notification. Please re-connect your Google account.',
        });
        return;
      }

      res.json({
        ok: true,
        messageId: gmailJson.id ?? null,
        sentTo: CONTACT_INFO.email,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send Gmail order alert.';
      res.status(500).json({ error: msg });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const videosDir = path.resolve(process.cwd(), 'src', 'assets', 'videos');
    const heroMediaConfigPath = path.resolve(process.cwd(), 'src', 'config', 'heroMedia.ts');

    const writeHeroMediaConfig = async (videoSrc: string, showOverlay: boolean) => {
      fs.mkdirSync(path.dirname(heroMediaConfigPath), { recursive: true });
      const content = [
        '// Owner-managed hero banner video configuration.',
        "// Leave HERO_CUSTOM_VIDEO_SRC as '' to display the built-in Sillux animated commercial reel.",
        `export const HERO_CUSTOM_VIDEO_SRC = ${JSON.stringify(videoSrc)};`,
        `export const HERO_SHOW_TITLE_OVERLAY = ${Boolean(showOverlay)};`,
        '',
      ].join('\n');
      fs.writeFileSync(heroMediaConfigPath, content, 'utf-8');
      const { build } = await import('vite');
      await build({ mode: 'production', logLevel: 'silent' });
    };

    const clearSavedVideoFiles = () => {
      if (!fs.existsSync(videosDir)) return;
      for (const name of fs.readdirSync(videosDir)) {
        const candidate = path.resolve(videosDir, name);
        if (candidate.startsWith(videosDir + path.sep) && name.startsWith('hero-video.')) {
          fs.rmSync(candidate, { force: true });
        }
      }
    };

    app.post(
      '/api/dev/hero-video',
      express.raw({
        type: ['video/mp4', 'video/webm', 'video/quicktime'],
        limit: '45mb',
      }),
      async (req, res) => {
        try {
          const contentType = String(req.headers['content-type'] || '').split(';')[0].trim();

          if (contentType === 'application/json') {
            const { videoUrl, showOverlay } = (req.body || {}) as {
              videoUrl?: unknown;
              showOverlay?: unknown;
            };
            const trimmed = typeof videoUrl === 'string' ? videoUrl.trim() : '';
            if (trimmed) {
              const isRelative = trimmed.startsWith('/') || trimmed.startsWith('./');
              if (!isRelative) {
                const parsed = new URL(trimmed);
                if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                  res.status(400).json({ error: 'Only HTTP/HTTPS or relative video paths are allowed.' });
                  return;
                }
              }
            }
            await writeHeroMediaConfig(trimmed, showOverlay !== false);
            res.json({ ok: true, videoSrc: trimmed });
            return;
          }

          const extMap: Record<string, string> = {
            'video/mp4': '.mp4',
            'video/webm': '.webm',
            'video/quicktime': '.mov',
          };
          const ext = extMap[contentType];
          if (!ext || !Buffer.isBuffer(req.body) || req.body.length === 0) {
            res.status(400).json({ error: 'Unsupported or empty video file (MP4, WebM, MOV only).' });
            return;
          }

          fs.mkdirSync(videosDir, { recursive: true });
          clearSavedVideoFiles();
          const targetPath = path.resolve(videosDir, `hero-video${ext}`);
          if (!targetPath.startsWith(videosDir + path.sep)) {
            res.status(400).json({ error: 'Invalid video file destination.' });
            return;
          }
          fs.writeFileSync(targetPath, req.body);

          const relativeSrc = `./src/assets/videos/hero-video${ext}`;
          const showOverlay = String(req.headers['x-show-overlay'] ?? 'true') !== 'false';
          await writeHeroMediaConfig(relativeSrc, showOverlay);
          res.json({ ok: true, videoSrc: relativeSrc });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to save hero video.';
          res.status(500).json({ error: msg });
        }
      }
    );

    app.delete('/api/dev/hero-video', async (_req, res) => {
      try {
        clearSavedVideoFiles();
        await writeHeroMediaConfig('', true);
        res.json({ ok: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to reset hero video.';
        res.status(500).json({ error: msg });
      }
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    const serveDevHtml = async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const templatePath = path.resolve(process.cwd(), 'app.src.html');
        const template = fs.readFileSync(templatePath, 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        if (err instanceof Error) {
          vite.ssrFixStacktrace(err);
        }
        next(err);
      }
    };

    app.get(['/', '/index.html'], serveDevHtml);
    app.use(vite.middlewares);
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      void serveDevHtml(req, res, next);
    });
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Sillux server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
