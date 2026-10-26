import { BadgeFormData, EventConfig, OutputFormat } from '../types/badge';
import { generateQrCodeDataUrl } from '../utils/qrcode';

export interface RenderDimensions {
  w: number;
  h: number;
  margin: number;
  radius: number;
  notchRadius: number;
  perfAt: number; // coordinate of ticket perforation line
  perfAxis: 'x' | 'y';
}

export function getDimensionsForFormat(format: OutputFormat): RenderDimensions {
  switch (format) {
    case 'story': // 9:16 (Instagram Story, WhatsApp Status)
      return {
        w: 1080,
        h: 1920,
        margin: 48,
        radius: 48,
        notchRadius: 32,
        perfAt: 1480,
        perfAxis: 'y',
      };
    case 'square': // 1:1 (Square Feed Post)
      return {
        w: 1080,
        h: 1080,
        margin: 36,
        radius: 38,
        notchRadius: 24,
        perfAt: 820,
        perfAxis: 'y',
      };
    case 'landscape': // 16:9 (X / Twitter Post / Header)
      return {
        w: 1200,
        h: 675,
        margin: 28,
        radius: 32,
        notchRadius: 22,
        perfAt: 860,
        perfAxis: 'x',
      };
    case 'portrait': // 4:5 (LinkedIn / Instagram Post)
    default:
      return {
        w: 1080,
        h: 1350,
        margin: 36,
        radius: 40,
        notchRadius: 26,
        perfAt: 1040,
        perfAxis: 'y',
      };
  }
}

// Helper: load HTMLImageElement from URL with crossOrigin
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Rounded rectangle helper
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Ticket path with authentic circular notches on perforation line
function drawTicketPath(
  ctx: CanvasRenderingContext2D,
  dim: RenderDimensions,
  inset: number = 0
) {
  const x = dim.margin + inset;
  const y = dim.margin + inset;
  const w = dim.w - 2 * x;
  const h = dim.h - 2 * y;
  const r = Math.max(8, dim.radius - inset);
  const nr = dim.notchRadius + inset;
  const perf = dim.perfAt;
  const isX = dim.perfAxis === 'x';

  ctx.beginPath();
  // Top-left
  ctx.moveTo(x + r, y);

  if (isX) {
    // Notch on top edge at perf
    ctx.lineTo(perf - nr, y);
    ctx.arc(perf, y, nr, Math.PI, 0, true);
  }
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);

  if (!isX) {
    // Notch on right edge at perf
    ctx.lineTo(x + w, perf - nr);
    ctx.arc(x + w, perf, nr, -Math.PI / 2, Math.PI / 2, true);
  }
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);

  if (isX) {
    // Notch on bottom edge at perf
    ctx.lineTo(perf + nr, y + h);
    ctx.arc(perf, y + h, nr, 0, Math.PI, true);
  }
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);

  if (!isX) {
    // Notch on left edge at perf
    ctx.lineTo(x, perf + nr);
    ctx.arc(x, perf, nr, Math.PI / 2, -Math.PI / 2, true);
  }
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);

  ctx.closePath();
}

// Draw Google Developer Groups 4-color brackets
function drawGdgLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.translate(x, y);

  const unit = size / 24;
  ctx.lineWidth = unit * 3.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left bracket < (Google Blue & Red)
  ctx.strokeStyle = '#4285F4'; // Blue
  ctx.beginPath();
  ctx.moveTo(unit * 10, unit * 4);
  ctx.lineTo(unit * 4, unit * 10);
  ctx.stroke();

  ctx.strokeStyle = '#EA4335'; // Red
  ctx.beginPath();
  ctx.moveTo(unit * 4, unit * 10);
  ctx.lineTo(unit * 10, unit * 16);
  ctx.stroke();

  // Right bracket > (Google Green & Yellow)
  ctx.strokeStyle = '#34A853'; // Green
  ctx.beginPath();
  ctx.moveTo(unit * 14, unit * 4);
  ctx.lineTo(unit * 20, unit * 10);
  ctx.stroke();

  ctx.strokeStyle = '#FBBC04'; // Yellow
  ctx.beginPath();
  ctx.moveTo(unit * 20, unit * 10);
  ctx.lineTo(unit * 14, unit * 16);
  ctx.stroke();

  ctx.restore();
}

// Draw Google Cloud Logo Icon
function drawCloudIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Scaled 4-color cloud lobes
  const scale = width / 48;
  ctx.scale(scale, scale);

  // Blue lobe
  ctx.fillStyle = '#4285F4';
  ctx.beginPath();
  ctx.arc(18, 22, 10, 0, Math.PI * 2);
  ctx.fill();

  // Green lobe
  ctx.fillStyle = '#34A853';
  ctx.beginPath();
  ctx.arc(30, 22, 11, 0, Math.PI * 2);
  ctx.fill();

  // Yellow lobe
  ctx.fillStyle = '#FBBC04';
  ctx.beginPath();
  ctx.arc(24, 15, 11, 0, Math.PI * 2);
  ctx.fill();

  // Red lobe
  ctx.fillStyle = '#EA4335';
  ctx.beginPath();
  ctx.arc(14, 25, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw barcode graphic
function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  const barPattern = [
    2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 3, 2, 1, 4, 2, 1, 2,
    3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 4,
  ];
  let curX = x;
  const totalWeight = barPattern.reduce((a, b) => a + b, 0);
  const unit = width / totalWeight;

  for (let i = 0; i < barPattern.length; i++) {
    const w = barPattern[i] * unit;
    if (i % 2 === 0) {
      ctx.fillRect(curX, y, w, height);
    }
    curX += w;
  }
  ctx.restore();
}

/**
 * Main Badge Canvas Renderer function
 */
export async function renderBadgeToCanvas(
  canvas: HTMLCanvasElement,
  data: BadgeFormData,
  event: EventConfig,
  loadedPhotoImg?: HTMLImageElement | null
): Promise<void> {
  const dim = getDimensionsForFormat(data.format);
  canvas.width = dim.w;
  canvas.height = dim.h;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const theme =
    event.themes.find((t) => t.id === data.themeId) || event.themes[0];

  // 1. Draw outer bleed background
  ctx.fillStyle = theme.outer;
  ctx.fillRect(0, 0, dim.w, dim.h);

  // 2. Draw outer card shape with dropshadow
  ctx.save();
  ctx.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 15;

  if (data.layout === 'ticket') {
    drawTicketPath(ctx, dim);
  } else {
    drawRoundedRect(
      ctx,
      dim.margin,
      dim.margin,
      dim.w - 2 * dim.margin,
      dim.h - 2 * dim.margin,
      dim.radius
    );
  }
  ctx.fillStyle = theme.bg[0];
  ctx.fill();
  ctx.restore();

  // 3. Clip badge canvas to inner shape for gradient and content
  ctx.save();
  if (data.layout === 'ticket') {
    drawTicketPath(ctx, dim);
  } else {
    drawRoundedRect(
      ctx,
      dim.margin,
      dim.margin,
      dim.w - 2 * dim.margin,
      dim.h - 2 * dim.margin,
      dim.radius
    );
  }
  ctx.clip();

  // Fill gradient
  const bgGrad = ctx.createLinearGradient(0, 0, dim.w, dim.h);
  bgGrad.addColorStop(0, theme.bg[0]);
  bgGrad.addColorStop(1, theme.bg[1]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, dim.w, dim.h);

  // Draw background motif depending on theme
  drawBackgroundMotif(ctx, dim, theme);

  // 4. Render Layout specifics
  if (data.layout === 'ticket') {
    await renderTicketLayout(ctx, dim, data, event, theme, loadedPhotoImg);
  } else {
    await renderCreatorLayout(ctx, dim, data, event, theme, loadedPhotoImg);
  }

  // 5. Draw border outline
  ctx.restore(); // Restore unclipped state
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = theme.border;
  if (data.layout === 'ticket') {
    drawTicketPath(ctx, dim);
  } else {
    drawRoundedRect(
      ctx,
      dim.margin,
      dim.margin,
      dim.w - 2 * dim.margin,
      dim.h - 2 * dim.margin,
      dim.radius
    );
  }
  ctx.stroke();
  ctx.restore();
}

function drawBackgroundMotif(
  ctx: CanvasRenderingContext2D,
  dim: RenderDimensions,
  theme: any
) {
  ctx.save();
  if (theme.id === 'builder-edition') {
    // Glowing ambient orbs
    const g1 = ctx.createRadialGradient(
      dim.w * 0.85,
      dim.h * 0.2,
      0,
      dim.w * 0.85,
      dim.h * 0.2,
      dim.w * 0.5
    );
    g1.addColorStop(0, '#4285F444');
    g1.addColorStop(1, '#4285F400');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, dim.w, dim.h);

    const g2 = ctx.createRadialGradient(
      dim.w * 0.15,
      dim.h * 0.65,
      0,
      dim.w * 0.15,
      dim.h * 0.65,
      dim.w * 0.45
    );
    g2.addColorStop(0, '#A142F444');
    g2.addColorStop(1, '#A142F400');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, dim.w, dim.h);

    // Subtle code grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < dim.w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dim.h);
      ctx.stroke();
    }
    for (let y = 0; y < dim.h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dim.w, y);
      ctx.stroke();
    }
  } else if (theme.id === 'cloud-explorer') {
    // Soft Google Cloud blue radiant glow
    const g1 = ctx.createRadialGradient(
      dim.w * 0.9,
      dim.h * 0.15,
      0,
      dim.w * 0.9,
      dim.h * 0.15,
      dim.w * 0.6
    );
    g1.addColorStop(0, '#4285F425');
    g1.addColorStop(1, '#4285F400');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, dim.w, dim.h);

    // Cloud circuit dots
    ctx.fillStyle = '#4285F415';
    for (let x = dim.margin + 40; x < dim.w - dim.margin; x += 48) {
      for (let y = dim.margin + 40; y < dim.h - dim.margin; y += 48) {
        if ((x + y) % 96 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else {
    // Campus Edition: Warm Google 4-color geometry
    ctx.fillStyle = '#EA433512';
    ctx.beginPath();
    ctx.arc(dim.w * 0.9, dim.h * 0.1, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4285F410';
    ctx.beginPath();
    ctx.arc(dim.w * 0.1, dim.h * 0.7, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FBBC0415';
    ctx.beginPath();
    ctx.arc(dim.w * 0.85, dim.h * 0.55, 120, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Renders the TICKET layout (Perforations, QR code, Barcode, Stubs)
 */
async function renderTicketLayout(
  ctx: CanvasRenderingContext2D,
  dim: RenderDimensions,
  data: BadgeFormData,
  event: EventConfig,
  theme: any,
  photoImg?: HTMLImageElement | null
) {
  const isLandscape = dim.perfAxis === 'x';
  const perf = dim.perfAt;

  // 1. Draw stub background on the perforation side
  ctx.save();
  ctx.fillStyle = theme.stub;
  if (isLandscape) {
    ctx.fillRect(perf, 0, dim.w - perf, dim.h);
  } else {
    ctx.fillRect(0, perf, dim.w, dim.h - perf);
  }
  ctx.restore();

  // 2. Draw dashed perforation line
  ctx.save();
  ctx.strokeStyle = theme.dark
    ? 'rgba(255, 255, 255, 0.25)'
    : 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  if (isLandscape) {
    ctx.moveTo(perf, dim.margin);
    ctx.lineTo(perf, dim.h - dim.margin);
  } else {
    ctx.moveTo(dim.margin, perf);
    ctx.lineTo(dim.w - dim.margin, perf);
  }
  ctx.stroke();
  ctx.restore();

  // 3. Render Main Section (Pass details, photo, branding, stickers)
  if (isLandscape) {
    // Landscape: Photo on left, info middle, stub on right
    await renderLandscapeTicketMain(ctx, dim, data, event, theme, photoImg);
    await renderLandscapeTicketStub(ctx, dim, data, event, theme);
  } else {
    // Portrait / Story / Square: Main on top, stub on bottom
    await renderVerticalTicketMain(ctx, dim, data, event, theme, photoImg);
    await renderVerticalTicketStub(ctx, dim, data, event, theme);
  }
}

async function renderVerticalTicketMain(
  ctx: CanvasRenderingContext2D,
  dim: RenderDimensions,
  data: BadgeFormData,
  event: EventConfig,
  theme: any,
  photoImg?: HTMLImageElement | null
) {
  const startX = dim.margin + 44;
  const topY = dim.margin + (dim.h > 1500 ? 120 : 44);

  // A. Header Row: GDG Brackets + Event Title
  drawGdgLogo(ctx, startX, topY, 44);
  drawCloudIcon(ctx, startX + 54, topY - 2, 36);

  ctx.save();
  ctx.fillStyle = theme.text;
  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(event.organization, startX + 104, topY + 16);

  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.sub;
  ctx.fillText(event.community, startX + 104, topY + 36);

  // Event Edition badge top right
  const editionText = event.edition.toUpperCase();
  ctx.font = '700 13px "JetBrains Mono", monospace';
  const edWidth = ctx.measureText(editionText).width + 24;
  const edX = dim.w - startX - edWidth;

  drawRoundedRect(ctx, edX, topY + 6, edWidth, 30, 15);
  ctx.fillStyle = theme.pillBg;
  ctx.fill();
  ctx.strokeStyle = theme.pillBorder;
  ctx.stroke();

  ctx.fillStyle = theme.accent;
  ctx.fillText(editionText, edX + 12, topY + 26);
  ctx.restore();

  // B. Event Big Title
  const titleY = topY + 84;
  ctx.save();
  ctx.fillStyle = theme.text;
  ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '-0.5px';
  ctx.fillText(event.title, startX, titleY);

  ctx.fillStyle = theme.accent;
  ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(event.subtitle, startX, titleY + 42);
  ctx.restore();

  // C. Attendee Kind Tag ("I'm attending / speaking...")
  const kindY = titleY + 70;
  const kindVerb =
    data.kind === 'speaker'
      ? "I'M SPEAKING"
      : data.kind === 'volunteer'
      ? "I'M VOLUNTEERING"
      : data.kind === 'facilitator'
      ? "I'M FACILITATING"
      : "I'M ATTENDING";

  ctx.save();
  ctx.font = '800 14px "JetBrains Mono", monospace';
  const kindW = ctx.measureText(kindVerb).width + 28;
  drawRoundedRect(ctx, startX, kindY, kindW, 32, 8);
  ctx.fillStyle = theme.tagBg;
  ctx.fill();
  ctx.fillStyle = theme.tagText;
  ctx.fillText(kindVerb, startX + 14, kindY + 21);
  ctx.restore();

  // D. Photo Area
  // If story format, we have more height, so photo is larger
  const isStory = dim.h > 1500;
  const photoSize = isStory ? 280 : 230;
  const photoX = startX;
  const photoY = kindY + 54;
  const centerX = photoX + photoSize / 2;
  const centerY = photoY + photoSize / 2;

  // Photo outer rings
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, photoSize / 2 + 8, 0, Math.PI * 2);
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Clip circle for photo
  ctx.beginPath();
  ctx.arc(centerX, centerY, photoSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = theme.photoBg;
  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  if (photoImg && photoImg.complete && photoImg.naturalWidth > 0) {
    drawZoomedPhoto(ctx, photoImg, photoX, photoY, photoSize, photoSize, data.photoFit);
  } else {
    // Fallback: Elegant Monogram / Initials
    drawPhotoPlaceholder(ctx, photoX, photoY, photoSize, data.fullName, theme);
  }
  ctx.restore();

  // E. Right of Photo: Attendee Details (Name, Handle, Role, Track)
  const infoX = photoX + photoSize + 36;
  const infoWidth = dim.w - startX - infoX;
  let infoY = photoY + 28;

  // Name
  ctx.save();
  ctx.fillStyle = theme.text;
  const displayName = data.fullName.trim() || 'Attendee Name';
  // Autoscale font size
  let nameFontSize = 42;
  ctx.font = `900 ${nameFontSize}px "Plus Jakarta Sans", sans-serif`;
  while (ctx.measureText(displayName).width > infoWidth && nameFontSize > 22) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px "Plus Jakarta Sans", sans-serif`;
  }
  ctx.fillText(displayName, infoX, infoY + nameFontSize * 0.75);
  infoY += nameFontSize + 14;

  // Social Handle
  if (data.handle) {
    const handleText = data.handle.startsWith('@') ? data.handle : `@${data.handle}`;
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.accent;
    ctx.fillText(handleText, infoX, infoY + 16);
    infoY += 34;
  }

  // Role Pill
  const roleText = data.role || event.defaultRole;
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  const roleW = ctx.measureText(roleText).width + 28;
  drawRoundedRect(ctx, infoX, infoY, Math.min(roleW, infoWidth), 34, 17);
  ctx.fillStyle = theme.pillBg;
  ctx.fill();
  ctx.strokeStyle = theme.pillBorder;
  ctx.stroke();
  ctx.fillStyle = theme.text;
  ctx.fillText(roleText, infoX + 14, infoY + 23);
  infoY += 46;

  // Track Pill
  const trackObj = event.tracks.find((t) => t.id === data.trackId);
  const trackLabel = trackObj ? `${trackObj.icon} ${trackObj.label}` : 'Google Cloud';
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  const trackW = ctx.measureText(trackLabel).width + 24;
  drawRoundedRect(ctx, infoX, infoY, Math.min(trackW, infoWidth), 32, 16);
  ctx.fillStyle = theme.pillBg;
  ctx.fill();
  ctx.strokeStyle = theme.pillBorder;
  ctx.stroke();
  ctx.fillStyle = theme.sub;
  ctx.fillText(trackLabel, infoX + 12, infoY + 21);
  ctx.restore();

  // F. Stickers Row (under photo and info)
  const stickersY = Math.max(photoY + photoSize + 32, infoY + 20);
  if (data.stickers.length > 0) {
    ctx.save();
    let stickerX = startX;
    for (const stickerId of data.stickers.slice(0, 3)) {
      const stickerObj = event.stickers.find((s) => s.id === stickerId);
      if (!stickerObj) continue;
      const label = `${stickerObj.emoji} ${stickerObj.label}`;
      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      const sW = ctx.measureText(label).width + 28;
      if (stickerX + sW > dim.w - startX) break;

      drawRoundedRect(ctx, stickerX, stickersY, sW, 38, 19);
      ctx.fillStyle = theme.pillBg;
      ctx.fill();
      ctx.strokeStyle = theme.pillBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = theme.text;
      ctx.fillText(label, stickerX + 14, stickersY + 24);
      stickerX += sW + 14;
    }
    ctx.restore();
  }
}

async function renderVerticalTicketStub(
  ctx: CanvasRenderingContext2D,
  dim: RenderDimensions,
  data: BadgeFormData,
  event: EventConfig,
  theme: any
) {
  const startX = dim.margin + 44;
  const stubY = dim.perfAt + 32;
  const stubHeight = dim.h - dim.perfAt - dim.margin - 32;

  // A. Generate and Draw QR Code on left of stub
  const qrUrl = event.registrationUrl;
  const qrDataUrl = await generateQrCodeDataUrl(
    qrUrl,
    theme.stubText,
    theme.stub
  );
  const qrImg = await loadImage(qrDataUrl).catch(() => null);

  const qrSize = Math.min(stubHeight - 20, 160);
  if (qrImg) {
    ctx.drawImage(qrImg, startX, stubY, qrSize, qrSize);
  }

  // B. Middle of stub: Event metadata (Date, Venue, Ticket ID)
  const metaX = startX + qrSize + 28;
  ctx.save();

  // Ticket ID
  const ticketId = `PASS #${generateShortHash(data.fullName || 'GUEST')}`;
  ctx.font = '800 14px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.stubAccent;
  ctx.fillText(ticketId, metaX, stubY + 24);

  // Event Date
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.stubText;
  ctx.fillText(event.date, metaX, stubY + 54);

  // Venue
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.stubSub;
  ctx.fillText(event.venue, metaX, stubY + 80);

  // Scan note
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.stubAccent;
  ctx.fillText('SCAN FOR EVENT GUIDE & LAB ACCESS →', metaX, stubY + 112);
  ctx.restore();

  // C. Right of stub: Authentic Barcode
  const barcodeW = 140;
  const barcodeX = dim.w - startX - barcodeW;
  const barcodeH = qrSize - 20;
  drawBarcode(ctx, barcodeX, stubY + 8, barcodeW, barcodeH, theme.stubText);
}

// Landscape Ticket Layout (Side-by-Side)
async function renderLandscapeTicketMain(
  ctx: CanvasRenderingContext2D,
  dim: RenderDimensions,
  data: BadgeFormData,
  event: EventConfig,
  theme: any,
  photoImg?: HTMLImageElement | null
) {
  const startX = dim.margin + 36;
  const topY = dim.margin + 32;

  // Photo on the left of main section
  const photoSize = 200;
  const photoX = startX;
  const photoY = topY + 40;
  const centerX = photoX + photoSize / 2;
  const centerY = photoY + photoSize / 2;

  // Header row above photo
  drawGdgLogo(ctx, startX, topY, 36);
  ctx.save();
  ctx.fillStyle = theme.text;
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(event.organization, startX + 44, topY + 18);
  ctx.restore();

  // Photo
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, photoSize / 2 + 6, 0, Math.PI * 2);
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, photoSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = theme.photoBg;
  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  if (photoImg && photoImg.complete && photoImg.naturalWidth > 0) {
    drawZoomedPhoto(ctx, photoImg, photoX, photoY, photoSize, photoSize, data.photoFit);
  } else {
    drawPhotoPlaceholder(ctx, photoX, photoY, photoSize, data.fullName, theme);
  }
  ctx.restore();

  // Info on right of photo
  const infoX = photoX + photoSize + 32;
  const infoW = dim.perfAt - infoX - 32;
  let infoY = topY + 40;

  ctx.save();
  // Event Title
  ctx.fillStyle = theme.text;
  ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(event.title, infoX, infoY + 24);
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.fillText(event.subtitle, infoX, infoY + 54);
  infoY += 76;

  // Attendee Name
  const displayName = data.fullName.trim() || 'Attendee Name';
  ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.text;
  ctx.fillText(displayName, infoX, infoY + 28);
  infoY += 46;

  // Handle & Role Row
  if (data.handle) {
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.accent;
    ctx.fillText(`@${data.handle.replace(/^@/, '')}`, infoX, infoY + 16);
    infoY += 30;
  }

  // Role Pill
  const roleText = data.role || event.defaultRole;
  ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
  const roleW = ctx.measureText(roleText).width + 24;
  drawRoundedRect(ctx, infoX, infoY, Math.min(roleW, infoW), 30, 15);
  ctx.fillStyle = theme.pillBg;
  ctx.fill();
  ctx.strokeStyle = theme.pillBorder;
  ctx.stroke();
  ctx.fillStyle = theme.text;
  ctx.fillText(roleText, infoX + 12, infoY + 20);

  // Stickers under photo
  if (data.stickers.length > 0) {
    const sObj = event.stickers.find((s) => s.id === data.stickers[0]);
    if (sObj) {
      const sLabel = `${sObj.emoji} ${sObj.label}`;
      const sW = ctx.measureText(sLabel).width + 24;
      drawRoundedRect(ctx, startX, photoY + photoSize + 16, sW, 30, 15);
      ctx.fillStyle = theme.pillBg;
      ctx.fill();
      ctx.strokeStyle = theme.pillBorder;
      ctx.stroke();
      ctx.fillStyle = theme.text;
      ctx.fillText(sLabel, startX + 12, photoY + photoSize + 36);
    }
  }
  ctx.restore();
}

async function renderLandscapeTicketStub(
  ctx: CanvasRenderingContext2D,
  dim: RenderDimensions,
  _data: BadgeFormData,
  event: EventConfig,
  theme: any
) {
  const startX = dim.perfAt + 32;
  const centerY = dim.h / 2;

  // QR Code
  const qrUrl = event.registrationUrl;
  const qrDataUrl = await generateQrCodeDataUrl(
    qrUrl,
    theme.stubText,
    theme.stub
  );
  const qrImg = await loadImage(qrDataUrl).catch(() => null);

  const qrSize = 130;
  if (qrImg) {
    ctx.drawImage(qrImg, startX, centerY - qrSize / 2 - 30, qrSize, qrSize);
  }

  ctx.save();
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.stubAccent;
  ctx.fillText('STUDY JAMS PASS', startX, centerY + qrSize / 2);

  ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.stubText;
  ctx.fillText(event.date, startX, centerY + qrSize / 2 + 24);

  // Barcode rotated or at bottom
  drawBarcode(ctx, startX, centerY + qrSize / 2 + 38, qrSize, 28, theme.stubText);
  ctx.restore();
}

/**
 * Renders the CREATOR layout (Hero photo, bold modern badge, stickers)
 */
async function renderCreatorLayout(
  ctx: CanvasRenderingContext2D,
  dim: RenderDimensions,
  data: BadgeFormData,
  event: EventConfig,
  theme: any,
  photoImg?: HTMLImageElement | null
) {
  const startX = dim.margin + 44;
  const contentWidth = dim.w - 2 * startX;
  const isLandscape = dim.w > dim.h;
  const isStory = dim.h > 1500;
  const topY = dim.margin + (isStory ? 100 : 44);

  // 1. Header Row
  drawGdgLogo(ctx, startX, topY, 44);
  drawCloudIcon(ctx, startX + 54, topY - 2, 36);

  ctx.save();
  ctx.fillStyle = theme.text;
  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(event.organization, startX + 104, topY + 16);

  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.sub;
  ctx.fillText(event.community, startX + 104, topY + 36);

  // Tag: "I'm attending / speaking"
  const kindVerb =
    data.kind === 'speaker'
      ? 'SPEAKER'
      : data.kind === 'volunteer'
      ? 'VOLUNTEER'
      : data.kind === 'facilitator'
      ? 'FACILITATOR'
      : 'ATTENDEE';

  ctx.font = '800 14px "JetBrains Mono", monospace';
  const tagW = ctx.measureText(kindVerb).width + 24;
  const tagX = dim.w - startX - tagW;
  drawRoundedRect(ctx, tagX, topY + 6, tagW, 30, 8);
  ctx.fillStyle = theme.tagBg;
  ctx.fill();
  ctx.fillStyle = theme.tagText;
  ctx.fillText(kindVerb, tagX + 12, topY + 26);
  ctx.restore();

  // 2. Large Photo Hero (Centered or Left depending on format)
  if (isLandscape) {
    // Landscape Creator
    const photoH = dim.h - 2 * dim.margin - 140;
    const photoW = photoH * 0.85;
    const photoX = startX;
    const photoY = topY + 60;

    // Draw Photo Box
    ctx.save();
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 28);
    ctx.fillStyle = theme.photoBg;
    ctx.fill();
    ctx.clip();
    if (photoImg && photoImg.complete && photoImg.naturalWidth > 0) {
      drawZoomedPhoto(ctx, photoImg, photoX, photoY, photoW, photoH, data.photoFit);
    } else {
      drawPhotoPlaceholder(ctx, photoX, photoY, photoW, data.fullName, theme);
    }
    ctx.restore();

    // Right column info
    const infoX = photoX + photoW + 48;
    const infoW = dim.w - startX - infoX;
    let infoY = photoY + 30;

    ctx.save();
    ctx.fillStyle = theme.text;
    ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(event.title, infoX, infoY + 36);
    infoY += 56;

    ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.accent;
    ctx.fillText(event.subtitle, infoX, infoY + 20);
    infoY += 56;

    // Attendee Name
    const displayName = data.fullName.trim() || 'Attendee Name';
    ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.text;
    ctx.fillText(displayName, infoX, infoY + 32);
    infoY += 56;

    if (data.handle) {
      ctx.font = '700 22px "JetBrains Mono", monospace';
      ctx.fillStyle = theme.accent;
      ctx.fillText(`@${data.handle.replace(/^@/, '')}`, infoX, infoY + 16);
      infoY += 40;
    }

    // Role & Track
    const roleText = data.role || event.defaultRole;
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    const rW = ctx.measureText(roleText).width + 28;
    drawRoundedRect(ctx, infoX, infoY, Math.min(rW, infoW), 36, 18);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.fillText(roleText, infoX + 14, infoY + 24);
    ctx.restore();
  } else {
    // Portrait / Story / Square Creator
    const photoSize = isStory ? 480 : dim.h === 1080 ? 340 : 420;
    const photoX = (dim.w - photoSize) / 2;
    const photoY = topY + 70;

    // Rounded photo hero with specular shadow
    ctx.save();
    ctx.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 12;
    drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, 36);
    ctx.fillStyle = theme.photoBg;
    ctx.fill();
    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, 36);
    ctx.clip();
    if (photoImg && photoImg.complete && photoImg.naturalWidth > 0) {
      drawZoomedPhoto(ctx, photoImg, photoX, photoY, photoSize, photoSize, data.photoFit);
    } else {
      drawPhotoPlaceholder(ctx, photoX, photoY, photoSize, data.fullName, theme);
    }
    ctx.restore();

    // Border around photo
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = theme.border;
    drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, 36);
    ctx.stroke();
    ctx.restore();

    // Info below photo
    let curY = photoY + photoSize + 48;

    // Attendee Name
    ctx.save();
    ctx.textAlign = 'center';
    const displayName = data.fullName.trim() || 'Attendee Name';
    let nameSize = isStory ? 58 : 48;
    ctx.font = `900 ${nameSize}px "Plus Jakarta Sans", sans-serif`;
    while (ctx.measureText(displayName).width > contentWidth && nameSize > 26) {
      nameSize -= 2;
      ctx.font = `900 ${nameSize}px "Plus Jakarta Sans", sans-serif`;
    }
    ctx.fillStyle = theme.text;
    ctx.fillText(displayName, dim.w / 2, curY);
    curY += nameSize * 0.7 + 10;

    // Handle
    if (data.handle) {
      const handleText = data.handle.startsWith('@') ? data.handle : `@${data.handle}`;
      ctx.font = '700 24px "JetBrains Mono", monospace';
      ctx.fillStyle = theme.accent;
      ctx.fillText(handleText, dim.w / 2, curY);
      curY += 34;
    }

    // Role & Track row
    const roleText = data.role || event.defaultRole;
    const trackObj = event.tracks.find((t) => t.id === data.trackId);
    const trackText = trackObj ? `${trackObj.icon} ${trackObj.label}` : 'Google Cloud';

    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    const rW = ctx.measureText(roleText).width + 30;
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    const tW = ctx.measureText(trackText).width + 26;

    const totalPillsW = rW + tW + 16;
    let pillStartX = (dim.w - totalPillsW) / 2;

    // Draw Role Pill
    ctx.textAlign = 'left';
    drawRoundedRect(ctx, pillStartX, curY, rW, 38, 19);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(roleText, pillStartX + 15, curY + 25);

    // Draw Track Pill
    drawRoundedRect(ctx, pillStartX + rW + 16, curY, tW, 38, 19);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.sub;
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(trackText, pillStartX + rW + 16 + 13, curY + 24);
    curY += 56;

    // Stickers Row
    if (data.stickers.length > 0) {
      let stickerPillWidths: { label: string; width: number }[] = [];
      ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
      for (const stickerId of data.stickers.slice(0, 3)) {
        const sObj = event.stickers.find((s) => s.id === stickerId);
        if (!sObj) continue;
        const sLabel = `${sObj.emoji} ${sObj.label}`;
        const w = ctx.measureText(sLabel).width + 28;
        stickerPillWidths.push({ label: sLabel, width: w });
      }

      const totalStickersW =
        stickerPillWidths.reduce((sum, item) => sum + item.width, 0) +
        (stickerPillWidths.length - 1) * 12;
      let sX = (dim.w - totalStickersW) / 2;

      for (const item of stickerPillWidths) {
        drawRoundedRect(ctx, sX, curY, item.width, 38, 19);
        ctx.fillStyle = theme.pillBg;
        ctx.fill();
        ctx.strokeStyle = theme.pillBorder;
        ctx.stroke();

        ctx.fillStyle = theme.text;
        ctx.fillText(item.label, sX + 14, curY + 25);
        sX += item.width + 12;
      }
      curY += 56;
    }

    // Footer Watermark / Event branding
    const footerY = dim.h - dim.margin - 40;
    ctx.textAlign = 'center';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.text;
    ctx.fillText(event.title, dim.w / 2, footerY);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.sub;
    ctx.fillText(`${event.edition} • ${event.date}`, dim.w / 2, footerY + 24);
    ctx.restore();
  }
}

// Draw user's photo with zoom and focal point offset
function drawZoomedPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  targetW: number,
  targetH: number,
  fit: { zoom: number; fx: number; fy: number }
) {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;

  const baseScale = Math.max(targetW / nw, targetH / nh);
  const scale = baseScale * (fit.zoom || 1);

  const drawW = nw * scale;
  const drawH = nh * scale;

  // Focal point offsets
  const fx = fit.fx ?? 0.5;
  const fy = fit.fy ?? 0.5;

  const dx = (targetW - drawW) * fx;
  const dy = (targetH - drawH) * fy;

  ctx.drawImage(img, x + dx, y + dy, drawW, drawH);
}

// Draw placeholder monogram if no photo is provided
function drawPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  name: string,
  theme: any
) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  // Background gradient
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, theme.accent + '25');
  grad.addColorStop(1, theme.accent + '65');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);

  // Initials
  const cleanName = (name || 'Attendee').trim();
  const initials = cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  ctx.save();
  ctx.fillStyle = theme.accent;
  ctx.font = `900 ${Math.floor(size * 0.38)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials || 'GDG', centerX, centerY);
  ctx.restore();
}

function generateShortHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(-4);
}
