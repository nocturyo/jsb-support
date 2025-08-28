import { createCanvas, loadImage } from '@napi-rs/canvas';
import { request } from 'undici';
import fs from 'node:fs/promises';

// === KONFIG DOPASOWANY DO BAZY 500×281 ===
// Wszystko liczony w UŁAMKACH szer./wys. obrazka (działa też dla innych rozmiarów).
const CFG = {
  // Avatar wyśrodkowany nad kreską
  AVATAR: {
    diameterH: 0.235,    // średnica = 23.5% wysokości (ok. 66 px przy 281)
    centerX: 0.5,        // środek w poziomie (x = 50% szerokości)
    topY: 0.085,         // górna krawędź ~ 8.5% wysokości (ok. 24 px)
    ringWidth: 0.06,     // grubość obwódki = 6% średnicy
    shadowBlur: 18,      // delikatny cień pod avatarem
  },

  // Tytuł: sama NAZWA (biała), wyśrodkowana
  TITLE: {
    centerX: 0.5,
    topY: 0.662,         // ~186 px przy 281
    fontH: 0.135,        // wysokość fontu ~ 13.5% H (auto-fit przy bardzo długich nickach)
    color: '#ffffff',
    shadowBlur: 10,
  },

  // Podtytuł: "WITAMY NA SERWERZE!" (niebieski), wyśrodkowany niżej
  SUB: {
    centerX: 0.5,
    topY: 0.748,         // ~210 px przy 281
    fontH: 0.078,        // ~22 px przy 281
    color: '#0a59f6',
    shadowBlur: 8,
  },

  // Kolory obwódki avatara
  ACCENT1: '#ffffff',
  ACCENT2: '#0a59f6',

  // Bezpieczny prawy margines dla auto-fit tekstu
  RIGHT_PAD: 0.96,       // tekst nie przekroczy 96% szerokości
};

export interface WelcomeOptions {
  basePath: string;      // absolutna ścieżka do assets/welcome_base.png
  avatarURL: string;     // URL avatara (PNG)
  displayName: string;   // np. member.displayName / user.globalName / user.username
  memberNumber: number;  // używamy do "Użytkownik #...", ale tu generujemy stałe "WITAMY NA SERWERZE!"
}

// mały helper na cień (używamy 'any' — TS bez typów DOM)
function withShadow(ctx: any, blur: number, fn: () => void) {
  const old = {
    color: ctx.shadowColor,
    blur: ctx.shadowBlur,
    x: ctx.shadowOffsetX,
    y: ctx.shadowOffsetY,
  };
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  try { fn(); } finally {
    ctx.shadowColor = old.color;
    ctx.shadowBlur = old.blur;
    ctx.shadowOffsetX = old.x;
    ctx.shadowOffsetY = old.y;
  }
}

// auto-dopasowanie czcionki, żeby nie wychodziła poza prawą krawędź
function fitTextSize(ctx: any, text: string, desiredPx: number, xPx: number, rightLimitPx: number, weight = 800) {
  let size = desiredPx;
  ctx.font = `${weight} ${size}px sans-serif`;
  let w = ctx.measureText(text).width;
  // nie schodzimy poniżej 65% docelowego rozmiaru
  while (xPx + w / 2 > rightLimitPx && size > desiredPx * 0.65) {
    size -= 1;
    ctx.font = `${weight} ${size}px sans-serif`;
    w = ctx.measureText(text).width;
  }
  return size;
}

export async function renderWelcomeCard(opts: WelcomeOptions) {
  // tło
  const baseBuf = await fs.readFile(opts.basePath);
  const base = await loadImage(baseBuf);
  const W = base.width;
  const H = base.height;

  const canvas = createCanvas(W, H);
  const ctx: any = canvas.getContext('2d');

  // rysuj tło
  ctx.drawImage(base, 0, 0, W, H);

  // === AVATAR (wyśrodkowany) ===
  const avatarResp = await request(opts.avatarURL);
  const avatarArr = await avatarResp.body.arrayBuffer();
  const avatar = await loadImage(Buffer.from(avatarArr));

  const dia = Math.round(H * CFG.AVATAR.diameterH);
  const ax = Math.round(W * CFG.AVATAR.centerX - dia / 2);
  const ay = Math.round(H * CFG.AVATAR.topY);

  // okrąg + cień
  withShadow(ctx, CFG.AVATAR.shadowBlur, () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax + dia / 2, ay + dia / 2, dia / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, ax, ay, dia, dia);
    ctx.restore();
  });

  // obwódka gradientowa
  const ring = Math.max(2, Math.round(dia * CFG.AVATAR.ringWidth));
  const gradRing = ctx.createLinearGradient(ax, ay, ax + dia, ay + dia);
  gradRing.addColorStop(0, CFG.ACCENT1);
  gradRing.addColorStop(1, CFG.ACCENT2);
  ctx.lineWidth = ring;
  ctx.strokeStyle = gradRing;
  ctx.beginPath();
  ctx.arc(ax + dia / 2, ay + dia / 2, dia / 2 - ring / 2, 0, Math.PI * 2);
  ctx.stroke();

  // === TYTUŁ (biały, wyśrodkowany): tylko nazwa ===
  const title = opts.displayName;
  const titleX = Math.round(W * CFG.TITLE.centerX);
  const titleY = Math.round(H * CFG.TITLE.topY);
  const rightLimit = Math.round(W * CFG.RIGHT_PAD);

  let titleSize = Math.round(H * CFG.TITLE.fontH);
  titleSize = fitTextSize(ctx, title, titleSize, titleX, rightLimit, 800);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `900 ${titleSize}px sans-serif`;
  ctx.fillStyle = CFG.TITLE.color;
  withShadow(ctx, CFG.TITLE.shadowBlur, () => ctx.fillText(title, titleX, titleY));

  // === PODTYTUŁ (niebieski, wyśrodkowany): "WITAMY NA SERWERZE!" ===
  const subtitle = 'WITAMY NA SERWERZE!';
  const subX = Math.round(W * CFG.SUB.centerX);
  const subY = Math.round(H * CFG.SUB.topY);
  let subSize = Math.round(H * CFG.SUB.fontH);
  subSize = fitTextSize(ctx, subtitle, subSize, subX, rightLimit, 800);

  ctx.font = `800 ${subSize}px sans-serif`;
  ctx.fillStyle = CFG.SUB.color;
  withShadow(ctx, CFG.SUB.shadowBlur, () => ctx.fillText(subtitle, subX, subY));

  return canvas.toBuffer('image/png');
}
