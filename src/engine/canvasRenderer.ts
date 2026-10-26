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
        radius: 44,
        notchRadius: 28,
        perfAt: 1020,
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

// Draw realistic physical lanyard punch slot at top center
function drawLanyardSlot(
  ctx: CanvasRenderingContext2D,
  dim: RenderDimensions,
  theme: any
) {
  const isLandscape = dim.perfAxis === 'x';
  const cx = isLandscape ? dim.perfAt / 2 : dim.w / 2;
  const cy = dim.margin + 24;
  const w = 110;
  const h = 18;
  const r = 9;

  ctx.save();
  // Outer metallic grommet border
  drawRoundedRect(ctx, cx - w / 2 - 3, cy - h / 2 - 3, w + 6, h + 6, r + 3);
  ctx.strokeStyle = theme.dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hole cut out (dark inner shadow simulation)
  drawRoundedRect(ctx, cx - w / 2, cy - h / 2, w, h, r);
  ctx.fillStyle = theme.dark ? '#03050a' : '#141720';
  ctx.fill();

  // Highlight bottom rim of slot
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + r, cy + h / 2);
  ctx.lineTo(cx + w / 2 - r, cy + h / 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// Draw iridescent holographic foil strip
function drawHologramFoil(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, 'rgba(234, 67, 53, 0.35)');
  grad.addColorStop(0.25, 'rgba(251, 188, 4, 0.45)');
  grad.addColorStop(0.5, 'rgba(52, 168, 83, 0.35)');
  grad.addColorStop(0.75, 'rgba(66, 133, 244, 0.45)');
  grad.addColorStop(1, 'rgba(161, 66, 244, 0.4)');

  drawRoundedRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Diagonal micro-security lines
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  for (let lx = x - h; lx < x + w + h; lx += 8) {
    ctx.beginPath();
    ctx.moveTo(lx, y + h);
    ctx.lineTo(lx + h, y);
    ctx.stroke();
  }
  ctx.restore();

  // Hologram micro text
  ctx.font = '800 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ AUTHENTIC GDG CREDENTIAL • VERIFIED STUDY JAMS 2026 ★', x + w / 2, y + h / 2);
  ctx.restore();
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
  ctx.lineWidth = unit * 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left bracket < (Google Blue & Red)
  ctx.strokeStyle = '#4285F4';
  ctx.beginPath();
  ctx.moveTo(unit * 10, unit * 4);
  ctx.lineTo(unit * 4, unit * 10);
  ctx.stroke();

  ctx.strokeStyle = '#EA4335';
  ctx.beginPath();
  ctx.moveTo(unit * 4, unit * 10);
  ctx.lineTo(unit * 10, unit * 16);
  ctx.stroke();

  // Right bracket > (Google Green & Yellow)
  ctx.strokeStyle = '#34A853';
  ctx.beginPath();
  ctx.moveTo(unit * 14, unit * 4);
  ctx.lineTo(unit * 20, unit * 10);
  ctx.stroke();

  ctx.strokeStyle = '#FBBC04';
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

  const scale = width / 48;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#4285F4';
  ctx.beginPath();
  ctx.arc(18, 22, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#34A853';
  ctx.beginPath();
  ctx.arc(30, 22, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FBBC04';
  ctx.beginPath();
  ctx.arc(24, 15, 11, 0, Math.PI * 2);
  ctx.fill();

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
  color: string,
  serial?: string
) {
  ctx.save();
  ctx.fillStyle = color;
  const barPattern = [
    2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 3, 2, 1, 4, 2, 1, 2,
    3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 4, 2, 2, 1, 3
  ];
  let curX = x;
  const totalWeight = barPattern.reduce((a, b) => a + b, 0);
  const unit = width / totalWeight;

  for (let i = 0; i < barPattern.length; i++) {
    const w = barPattern[i] * unit;
    if (i % 2 === 0) {
      ctx.fillRect(curX, y, w, height - (serial ? 16 : 0));
    }
    curX += w;
  }

  if (serial) {
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(serial, x + width / 2, y + height);
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
  // Ensure fonts are loaded before canvas rendering and text measurements
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Gracefully continue if fonts API unavailable
    }
  }

  const dim = getDimensionsForFormat(data.format);
  canvas.width = dim.w;
  canvas.height = dim.h;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const theme =
    event.themes.find((t) => t.id === data.themeId) || event.themes[0];

  // 1. Draw outer background bleed
  ctx.fillStyle = theme.outer;
  ctx.fillRect(0, 0, dim.w, dim.h);

  // 2. Draw outer card shape with rich realistic drop shadow
  ctx.save();
  ctx.shadowColor = theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 20;

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

  // Draw background motifs & isometric grid
  drawBackgroundMotif(ctx, dim, theme);

  // 4. Render Layout specifics
  if (data.layout === 'ticket') {
    await renderTicketLayout(ctx, dim, data, event, theme, loadedPhotoImg);
  } else {
    await renderCreatorLayout(ctx, dim, data, event, theme, loadedPhotoImg);
  }

  // Draw top lanyard punch hole for physical realism
  drawLanyardSlot(ctx, dim, theme);

  // 5. Draw border outline
  ctx.restore(); // Restore unclipped state
  ctx.save();
  ctx.lineWidth = 3.5;
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
      dim.h * 0.25,
      0,
      dim.w * 0.85,
      dim.h * 0.25,
      dim.w * 0.6
    );
    g1.addColorStop(0, 'rgba(66, 133, 244, 0.25)');
    g1.addColorStop(1, 'rgba(66, 133, 244, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, dim.w, dim.h);

    const g2 = ctx.createRadialGradient(
      dim.w * 0.15,
      dim.h * 0.75,
      0,
      dim.w * 0.15,
      dim.h * 0.75,
      dim.w * 0.55
    );
    g2.addColorStop(0, 'rgba(161, 66, 244, 0.25)');
    g2.addColorStop(1, 'rgba(161, 66, 244, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, dim.w, dim.h);

    // Subtle technical grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const step = 44;
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
    // Google Cloud Blue radiant glow
    const g1 = ctx.createRadialGradient(
      dim.w * 0.88,
      dim.h * 0.2,
      0,
      dim.w * 0.88,
      dim.h * 0.2,
      dim.w * 0.65
    );
    g1.addColorStop(0, 'rgba(66, 133, 244, 0.18)');
    g1.addColorStop(1, 'rgba(66, 133, 244, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, dim.w, dim.h);

    // Architectural cloud grid dots
    ctx.fillStyle = 'rgba(66, 133, 244, 0.12)';
    for (let x = dim.margin + 30; x < dim.w - dim.margin; x += 40) {
      for (let y = dim.margin + 30; y < dim.h - dim.margin; y += 40) {
        if ((x + y) % 80 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else {
    // Campus Edition: Warm Google 4-color geometry
    ctx.fillStyle = 'rgba(234, 67, 53, 0.1)';
    ctx.beginPath();
    ctx.arc(dim.w * 0.9, dim.h * 0.15, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(66, 133, 244, 0.08)';
    ctx.beginPath();
    ctx.arc(dim.w * 0.1, dim.h * 0.75, 200, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(251, 188, 4, 0.12)';
    ctx.beginPath();
    ctx.arc(dim.w * 0.85, dim.h * 0.6, 140, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Renders the TICKET layout (No dead void! Telemetry Grid, Hologram, Skill Shields, Boarding Stub)
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

  // 2. Draw authentic laser perforation line with notch depth
  ctx.save();
  ctx.strokeStyle = theme.dark
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
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

  // 3. Render Main Section
  if (isLandscape) {
    await renderLandscapeTicketMain(ctx, dim, data, event, theme, photoImg);
    await renderLandscapeTicketStub(ctx, dim, data, event, theme);
  } else {
    await renderVerticalTicketMain(ctx, dim, data, event, theme, photoImg);
    await renderVerticalTicketStub(ctx, dim, data, event, theme);
  }
}

// Draw guilloche / circuit trace security line
function drawLaserDivider(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y: number,
  x2: number,
  accentColor: string,
  isDark: boolean
) {
  ctx.save();
  const grad = ctx.createLinearGradient(x1, y, x2, y);
  grad.addColorStop(0, 'rgba(66, 133, 244, 0.1)');
  grad.addColorStop(0.2, accentColor);
  grad.addColorStop(0.5, '#FBBC04');
  grad.addColorStop(0.8, '#34A853');
  grad.addColorStop(1, 'rgba(234, 67, 53, 0.1)');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();

  // Subtle diamond tick in the center
  const cx = (x1 + x2) / 2;
  ctx.fillStyle = isDark ? '#ffffff' : accentColor;
  ctx.beginPath();
  ctx.moveTo(cx, y - 4);
  ctx.lineTo(cx + 4, y);
  ctx.lineTo(cx, y + 4);
  ctx.lineTo(cx - 4, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Draw official Event Specification & Lab Clearance Matrix Box (eliminates dead space!)
function drawEventSpecBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: any,
  data: BadgeFormData
) {
  ctx.save();
  // Outer container
  drawRoundedRect(ctx, x, y, w, h, 16);
  ctx.fillStyle = theme.pillBg;
  ctx.fill();
  ctx.strokeStyle = theme.pillBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Header banner inside the box
  const headerH = 34;
  drawRoundedRect(ctx, x, y, w, headerH, 16);
  ctx.fillStyle = theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
  ctx.fill();

  ctx.font = '800 12px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.accent;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ LAB SPECIFICATION & ACCESS PRIVILEGES // ED-2026', x + 18, y + headerH / 2);

  const statusTag = '● CLOUD SYNCED';
  ctx.font = '800 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#34A853';
  ctx.textAlign = 'right';
  ctx.fillText(statusTag, x + w - 18, y + headerH / 2);

  // 2x2 Grid of privileges
  const gridY = y + headerH + 12;
  const colW = (w - 36) / 2;
  const rowH = (h - headerH - 24) / 2;

  const modules = [
    {
      label: 'VERTEX AI & GEMINI LABS',
      value: 'TIER: UNLIMITED SANDBOX',
      icon: '🧠',
    },
    {
      label: 'CONTAINERS & CLOUD RUN',
      value: 'QUOTA: GRANTED (PRO)',
      icon: '📦',
    },
    {
      label: 'ARCADE SKILL BADGES',
      value: `${data.role?.toUpperCase() || 'DEVELOPER'} • 500 PTS`,
      icon: '⭐',
    },
    {
      label: 'COMMUNITY REPOSITORY',
      value: 'ACCESS: VERIFIED MERGE',
      icon: '🛡️',
    },
  ];

  modules.forEach((mod, idx) => {
    const colIdx = idx % 2;
    const rowIdx = Math.floor(idx / 2);
    const mx = x + 16 + colIdx * (colW + 8);
    const my = gridY + rowIdx * rowH;

    // Small module card
    drawRoundedRect(ctx, mx, my, colW, rowH - 6, 10);
    ctx.fillStyle = theme.dark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Label
    ctx.font = '800 11px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.sub;
    ctx.fillText(`${mod.icon} ${mod.label}`, mx + 12, my + 10);

    // Value
    ctx.font = '800 13px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.text;
    ctx.fillText(mod.value, mx + 12, my + 28);
  });

  ctx.restore();
}

// Draw high-density security guilloche ticker
function drawSecurityTicker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: any,
  hashVal: string
) {
  ctx.save();
  // Micro guilloche line background
  ctx.strokeStyle = theme.pillBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Primary security ticker line
  ctx.font = '800 11px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.accent;
  ctx.fillText(
    '◄◄ AUTHENTIC GDG ON CAMPUS EVENT PASS • NON-TRANSFERABLE • CRYPTOGRAPHIC ID: 2026-' +
      hashVal +
      ' ►►',
    x + w / 2,
    y + h * 0.35
  );

  // Secondary verification micro-text
  ctx.font = '700 9px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.sub;
  ctx.fillText(
    'ISSUED UNDER GOOGLE DEVELOPER GROUPS ACADEMIC LICENSE • REGION: ASIA-SOUTH1 • NODE: CAMPUS-CENTRAL',
    x + w / 2,
    y + h * 0.72
  );

  ctx.restore();
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
  const boxW = dim.w - 2 * startX;
  const isStory = dim.h > 1500;
  const isSquare = dim.h === 1080;

  // A. Hologram Security Ribbon
  const topY = dim.margin + (isStory ? 64 : isSquare ? 20 : 42);
  const foilH = isSquare ? 18 : 20;
  drawHologramFoil(ctx, startX, topY, boxW, foilH);

  // B. Header Row: GDG Brackets + Event Branding + Tier Tag
  const headerY = topY + foilH + (isSquare ? 12 : 16);
  drawGdgLogo(ctx, startX, headerY, isSquare ? 34 : 38);
  drawCloudIcon(ctx, startX + (isSquare ? 44 : 50), headerY - 2, isSquare ? 30 : 34);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.text;
  ctx.font = `900 ${isSquare ? 18 : 20}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText(event.organization.toUpperCase(), startX + (isSquare ? 86 : 96), headerY + 16);

  ctx.font = `700 ${isSquare ? 11 : 13}px "JetBrains Mono", monospace`;
  ctx.fillStyle = theme.sub;
  ctx.fillText(`${event.community.toUpperCase()} • ASIA-SOUTH1`, startX + (isSquare ? 86 : 96), headerY + 34);

  // Top Right Edition & Pass Tier Tag
  const tierText = 'ALL-ACCESS PASS';
  ctx.font = '800 12px "JetBrains Mono", monospace';
  const tierW = ctx.measureText(tierText).width + 24;
  const tierX = dim.w - startX - tierW;

  drawRoundedRect(ctx, tierX, headerY + 2, tierW, 28, 8);
  ctx.fillStyle = theme.tagBg;
  ctx.fill();
  ctx.fillStyle = theme.tagText;
  ctx.fillText(tierText, tierX + 12, headerY + 20);
  ctx.restore();

  // C. Big Event Title & Subtitle (Generously spaced for zero collisions)
  const titleY = headerY + (isSquare ? 62 : 86);
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.text;
  ctx.font = `900 ${isSquare ? 32 : 40}px "Plus Jakarta Sans", sans-serif`;
  ctx.letterSpacing = '-1px';
  ctx.fillText(event.title, startX, titleY);

  ctx.fillStyle = theme.accent;
  ctx.font = `800 ${isSquare ? 19 : 23}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText(event.subtitle, startX, titleY + (isSquare ? 26 : 32));
  ctx.restore();

  // Laser Divider Line
  const dividerY = titleY + (isSquare ? 38 : 46);
  drawLaserDivider(ctx, startX, dividerY, startX + boxW, theme.accent, theme.dark);

  // D. Attendee Identity Row (Photo + Massive Name + Role + Track)
  const photoSize = isStory ? 230 : isSquare ? 150 : 185;
  const photoX = startX;
  const photoY = dividerY + (isSquare ? 12 : 16);
  const centerX = photoX + photoSize / 2;
  const centerY = photoY + photoSize / 2;

  // Photo outer rings with Google 4-color quadrant ticks
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, photoSize / 2 + 8, 0, Math.PI * 2);
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Google 4-color quadrant ticks around photo
  const tickRadius = photoSize / 2 + 8;
  const colors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];
  colors.forEach((col, idx) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = 6;
    ctx.beginPath();
    const ang = (idx * Math.PI) / 2;
    ctx.arc(centerX, centerY, tickRadius, ang - 0.25, ang + 0.25);
    ctx.stroke();
  });

  // Clip circle for photo
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

  // "● ACTIVE BUILDER" status badge under photo
  ctx.save();
  const statusLabel = '● ACTIVE BUILDER';
  ctx.font = '800 11px "JetBrains Mono", monospace';
  const sBadgeW = ctx.measureText(statusLabel).width + 18;
  drawRoundedRect(ctx, centerX - sBadgeW / 2, photoY + photoSize - 14, sBadgeW, 24, 12);
  ctx.fillStyle = '#0F9D58';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(statusLabel, centerX, photoY + photoSize - 2);
  ctx.restore();

  // Info Column to the Right of Photo
  const infoX = photoX + photoSize + (isSquare ? 24 : 34);
  const infoW = dim.w - startX - infoX;
  let infoY = photoY + (isSquare ? 4 : 8);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Clearance Eyebrow
  const kindVerb =
    data.kind === 'speaker'
      ? 'KEYNOTE SPEAKER'
      : data.kind === 'volunteer'
      ? 'CORE VOLUNTEER'
      : data.kind === 'facilitator'
      ? 'STUDY JAM FACILITATOR'
      : 'OFFICIAL ATTENDEE';

  ctx.font = '800 12px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.accent;
  ctx.fillText(`// ${kindVerb}`, infoX, infoY + 12);
  infoY += 26;

  // Massive Display Name
  const displayName = data.fullName.trim() || 'Attendee Name';
  let nameSize = isSquare ? 36 : 44;
  ctx.font = `900 ${nameSize}px "Plus Jakarta Sans", sans-serif`;
  while (ctx.measureText(displayName).width > infoW && nameSize > 22) {
    nameSize -= 2;
    ctx.font = `900 ${nameSize}px "Plus Jakarta Sans", sans-serif`;
  }
  ctx.fillStyle = theme.text;
  ctx.fillText(displayName, infoX, infoY + nameSize * 0.76);
  infoY += nameSize + 10;

  // Terminal Handle
  const handleText = data.handle
    ? `>_ ${data.handle.startsWith('@') ? data.handle : `@${data.handle}`}`
    : `>_ @${displayName.toLowerCase().replace(/\s+/g, '')}`;
  ctx.font = `700 ${isSquare ? 16 : 19}px "JetBrains Mono", monospace`;
  ctx.fillStyle = theme.accent;
  ctx.fillText(handleText, infoX, infoY + 16);
  infoY += 30;

  // Role Pill & Track Pill
  const roleText = data.role || event.defaultRole;
  ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
  const roleW = ctx.measureText(roleText).width + 26;

  const trackObj = event.tracks.find((t) => t.id === data.trackId);
  const trackLabel = trackObj ? `${trackObj.icon} ${trackObj.label}` : 'Google Cloud';
  ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
  const trackW = ctx.measureText(trackLabel).width + 24;

  // Side-by-side if fits, else stacked
  const fitsSideBySide = roleW + trackW + 12 <= infoW;

  if (fitsSideBySide) {
    // Role pill
    drawRoundedRect(ctx, infoX, infoY, roleW, 32, 16);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.fillText(roleText, infoX + 13, infoY + 21);

    // Track pill
    drawRoundedRect(ctx, infoX + roleW + 10, infoY, trackW, 32, 16);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.sub;
    ctx.fillText(trackLabel, infoX + roleW + 10 + 12, infoY + 21);
  } else {
    // Stacked
    drawRoundedRect(ctx, infoX, infoY, Math.min(roleW, infoW), 30, 15);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.fillText(roleText, infoX + 13, infoY + 20);

    drawRoundedRect(ctx, infoX, infoY + 36, Math.min(trackW, infoW), 28, 14);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.sub;
    ctx.fillText(trackLabel, infoX + 12, infoY + 36 + 18);
  }
  ctx.restore();

  // =========================================================================
  // E. HIGH-DENSITY TELEMETRY MATRIX GRID
  // =========================================================================
  const matrixY = photoY + photoSize + (isSquare ? 18 : 28);
  const matrixH = isSquare ? 72 : 82;

  ctx.save();
  drawRoundedRect(ctx, startX, matrixY, boxW, matrixH, 16);
  ctx.fillStyle = theme.pillBg;
  ctx.fill();
  ctx.strokeStyle = theme.pillBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 4 Columns: TERMINAL | ZONE | CLEARANCE | HASH ID
  const colW = boxW / 4;
  const hashVal = generateShortHash(data.fullName || 'BUILDER');
  const telemetryData = [
    { label: 'TERMINAL', value: 'GCP-2026' },
    { label: 'ZONE', value: 'CAMPUS-01' },
    { label: 'CLEARANCE', value: 'ALL-ACCESS' },
    { label: 'PASS HASH', value: `#${hashVal}` },
  ];

  telemetryData.forEach((item, i) => {
    const colX = startX + i * colW;
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(colX, matrixY + 12);
      ctx.lineTo(colX, matrixY + matrixH - 12);
      ctx.strokeStyle = theme.pillBorder;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.sub;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, colX + colW / 2, matrixY + 24);

    ctx.font = `800 ${isSquare ? 14 : 16}px "JetBrains Mono", monospace`;
    ctx.fillStyle = theme.text;
    ctx.fillText(item.value, colX + colW / 2, matrixY + (isSquare ? 50 : 54));
  });
  ctx.restore();

  // =========================================================================
  // F. OFFICIAL SKILL SHIELDS & STICKERS BAR
  // =========================================================================
  const badgesY = matrixY + matrixH + (isSquare ? 12 : 16);
  const badgesH = isSquare ? 76 : 84;

  ctx.save();
  drawRoundedRect(ctx, startX, badgesY, boxW, badgesH, 16);
  ctx.fillStyle = theme.pillBg;
  ctx.fill();
  ctx.strokeStyle = theme.pillBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '800 11px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.accent;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('GOOGLE CLOUD CERTIFIED SPECIALIZATIONS //', startX + 18, badgesY + 24);

  // Render stickers inside the grid
  const stickersToRender =
    data.stickers.length > 0 ? data.stickers.slice(0, 3) : ['cloud-native', 'built-gemini'];
  let curBadgeX = startX + 18;

  stickersToRender.forEach((sId) => {
    const sObj = event.stickers.find((s) => s.id === sId);
    if (!sObj) return;

    const label = `${sObj.emoji} ${sObj.label}`;
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    const sW = ctx.measureText(label).width + 24;

    drawRoundedRect(ctx, curBadgeX, badgesY + 36, sW, 34, 17);
    ctx.fillStyle = theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
    ctx.fill();
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = theme.text;
    ctx.textBaseline = 'middle';
    ctx.fillText(label, curBadgeX + 12, badgesY + 53);
    curBadgeX += sW + 12;
  });
  ctx.restore();

  // =========================================================================
  // G. NEW: EVENT ACCESS & LAB SPECIFICATION MATRIX BOX (ZERO DEAD SPACE!)
  // =========================================================================
  if (!isSquare) {
    const specY = badgesY + badgesH + (isStory ? 24 : 16);
    const specH = isStory ? 280 : 190;
    drawEventSpecBox(ctx, startX, specY, boxW, specH, theme, data);

    // H. SECURITY GUILLOCHE TICKER & INTEGRITY BAR
    const secY = specY + specH + (isStory ? 24 : 14);
    const secH = isStory ? 70 : 54;
    drawSecurityTicker(ctx, startX, secY, boxW, secH, theme, hashVal);
  } else {
    // In Square, add a compact security ticker
    const secY = badgesY + badgesH + 12;
    drawSecurityTicker(ctx, startX, secY, boxW, 46, theme, hashVal);
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
  const stubY = dim.perfAt + 28;
  const stubHeight = dim.h - dim.perfAt - dim.margin - 28;

  // A. Generate and Draw QR Code inside a Tech Reticle
  const qrUrl = event.registrationUrl;
  const qrDataUrl = await generateQrCodeDataUrl(qrUrl, theme.stubText, theme.stub);
  const qrImg = await loadImage(qrDataUrl).catch(() => null);

  const qrSize = Math.min(stubHeight - 20, 165);
  if (qrImg) {
    ctx.save();
    ctx.drawImage(qrImg, startX + 8, stubY + 8, qrSize - 16, qrSize - 16);

    ctx.strokeStyle = theme.stubAccent;
    ctx.lineWidth = 3;
    const pad = 4;
    const rL = 16;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(startX + pad, stubY + pad + rL);
    ctx.lineTo(startX + pad, stubY + pad);
    ctx.lineTo(startX + pad + rL, stubY + pad);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(startX + qrSize - pad - rL, stubY + pad);
    ctx.lineTo(startX + qrSize - pad, stubY + pad);
    ctx.lineTo(startX + qrSize - pad, stubY + pad + rL);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(startX + pad, stubY + qrSize - pad - rL);
    ctx.lineTo(startX + pad, stubY + qrSize - pad);
    ctx.lineTo(startX + pad + rL, stubY + qrSize - pad);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(startX + qrSize - pad - rL, stubY + qrSize - pad);
    ctx.lineTo(startX + qrSize - pad, stubY + qrSize - pad);
    ctx.lineTo(startX + qrSize - pad, stubY + qrSize - pad - rL);
    ctx.stroke();
    ctx.restore();
  }

  // B. Flight-Style Event Metadata in Stub (Strictly left-aligned with generous leading)
  const metaX = startX + qrSize + 28;
  const hashVal = generateShortHash(data.fullName || 'STUDENT');

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Pass Tag & Checksum
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.stubAccent;
  ctx.fillText(`BOARDING PASS • GCSJ-26-${hashVal}`, metaX, stubY + 26);

  // Big Date
  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.stubText;
  ctx.fillText(event.date.toUpperCase(), metaX, stubY + 68);

  // Venue & Track
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.stubSub;
  ctx.fillText(event.venue, metaX, stubY + 98);

  // Action instructions
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.stubAccent;
  ctx.fillText('SCAN TO CLAIM LAB CREDITS & REPO ACCESS →', metaX, stubY + 128);

  // Issuer micro-line
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.stubSub;
  ctx.fillText('ISSUED BY GDG ON CAMPUS • ASIA-SOUTH1', metaX, stubY + 154);
  ctx.restore();

  // C. Right of stub: Authentic High-Density Barcode with Checksum
  const barcodeW = 150;
  const barcodeX = dim.w - startX - barcodeW;
  const barcodeH = qrSize - 16;
  drawBarcode(ctx, barcodeX, stubY + 10, barcodeW, barcodeH, theme.stubText, `*GCSJ-26-${hashVal}*`);
}

// Landscape Ticket Layout
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

  // Photo on the left
  const photoSize = 220;
  const photoX = startX;
  const photoY = topY + 44;
  const centerX = photoX + photoSize / 2;
  const centerY = photoY + photoSize / 2;

  // Header row above photo
  drawGdgLogo(ctx, startX, topY, 36);
  ctx.save();
  ctx.fillStyle = theme.text;
  ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(event.organization, startX + 44, topY + 18);
  ctx.restore();

  // Photo with quadrant ticks
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, photoSize / 2 + 8, 0, Math.PI * 2);
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3.5;
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
  const infoX = photoX + photoSize + 36;
  let infoY = topY + 40;

  ctx.save();
  // Event Title
  ctx.fillStyle = theme.text;
  ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(event.title, infoX, infoY + 24);
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.fillText(event.subtitle, infoX, infoY + 54);
  infoY += 76;

  // Attendee Name
  const displayName = data.fullName.trim() || 'Attendee Name';
  ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.text;
  ctx.fillText(displayName, infoX, infoY + 30);
  infoY += 50;

  // Handle & Role
  if (data.handle) {
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.accent;
    ctx.fillText(`>_ @${data.handle.replace(/^@/, '')}`, infoX, infoY + 16);
    infoY += 32;
  }

  // Telemetry Grid Row
  const hashVal = generateShortHash(data.fullName || 'GUEST');
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.sub;
  ctx.fillText(`TERMINAL: GCP-2026 • PASS ID: #${hashVal} • ACCESS: ALL-LEVELS`, infoX, infoY + 20);
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
  const qrDataUrl = await generateQrCodeDataUrl(qrUrl, theme.stubText, theme.stub);
  const qrImg = await loadImage(qrDataUrl).catch(() => null);

  const qrSize = 140;
  if (qrImg) {
    ctx.drawImage(qrImg, startX, centerY - qrSize / 2 - 36, qrSize, qrSize);
  }

  ctx.save();
  ctx.font = '800 14px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.stubAccent;
  ctx.fillText('STUDY JAMS PASS', startX, centerY + qrSize / 2 - 10);

  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.stubText;
  ctx.fillText(event.date, startX, centerY + qrSize / 2 + 16);

  // Barcode
  drawBarcode(ctx, startX, centerY + qrSize / 2 + 30, qrSize, 26, theme.stubText);
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
  const isLandscape = dim.w > dim.h;
  const isStory = dim.h > 1500;
  const topY = dim.margin + (isStory ? 80 : 54);

  // Header Row
  drawGdgLogo(ctx, startX, topY, 44);
  drawCloudIcon(ctx, startX + 54, topY - 2, 36);

  ctx.save();
  ctx.fillStyle = theme.text;
  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(event.organization, startX + 104, topY + 18);

  ctx.font = '700 15px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.sub;
  ctx.fillText(`${event.community.toUpperCase()} • EDITION 2026`, startX + 104, topY + 38);

  // Tag
  const kindVerb =
    data.kind === 'speaker'
      ? 'VIP SPEAKER'
      : data.kind === 'volunteer'
      ? 'CREW'
      : data.kind === 'facilitator'
      ? 'FACILITATOR'
      : 'BUILDER';

  ctx.font = '800 14px "JetBrains Mono", monospace';
  const tagW = ctx.measureText(kindVerb).width + 26;
  const tagX = dim.w - startX - tagW;
  drawRoundedRect(ctx, tagX, topY + 6, tagW, 30, 8);
  ctx.fillStyle = theme.tagBg;
  ctx.fill();
  ctx.fillStyle = theme.tagText;
  ctx.fillText(kindVerb, tagX + 13, topY + 26);
  ctx.restore();

  if (isLandscape) {
    // Landscape Creator
    const photoH = dim.h - 2 * dim.margin - 140;
    const photoW = photoH * 0.88;
    const photoX = startX;
    const photoY = topY + 60;

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
    let infoY = photoY + 24;

    ctx.save();
    ctx.fillStyle = theme.text;
    ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(event.title, infoX, infoY + 36);
    infoY += 56;

    ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.accent;
    ctx.fillText(event.subtitle, infoX, infoY + 20);
    infoY += 56;

    const displayName = data.fullName.trim() || 'Attendee Name';
    ctx.font = '900 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.text;
    ctx.fillText(displayName, infoX, infoY + 32);
    infoY += 56;

    if (data.handle) {
      ctx.font = '700 24px "JetBrains Mono", monospace';
      ctx.fillStyle = theme.accent;
      ctx.fillText(`>_ @${data.handle.replace(/^@/, '')}`, infoX, infoY + 16);
      infoY += 40;
    }

    const roleText = data.role || event.defaultRole;
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    const rW = ctx.measureText(roleText).width + 30;
    drawRoundedRect(ctx, infoX, infoY, rW, 38, 19);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.fillText(roleText, infoX + 15, infoY + 25);
    ctx.restore();
  } else {
    // Portrait / Story / Square Creator
    const photoSize = isStory ? 480 : dim.h === 1080 ? 360 : 420;
    const photoX = (dim.w - photoSize) / 2;
    const photoY = topY + 68;

    ctx.save();
    ctx.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, 40);
    ctx.fillStyle = theme.photoBg;
    ctx.fill();
    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, 40);
    ctx.clip();
    if (photoImg && photoImg.complete && photoImg.naturalWidth > 0) {
      drawZoomedPhoto(ctx, photoImg, photoX, photoY, photoSize, photoSize, data.photoFit);
    } else {
      drawPhotoPlaceholder(ctx, photoX, photoY, photoSize, data.fullName, theme);
    }
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = theme.border;
    drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, 40);
    ctx.stroke();
    ctx.restore();

    let curY = photoY + photoSize + 48;

    // Attendee Name
    ctx.save();
    ctx.textAlign = 'center';
    const displayName = data.fullName.trim() || 'Attendee Name';
    let nameSize = isStory ? 58 : 50;
    ctx.font = `900 ${nameSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = theme.text;
    ctx.fillText(displayName, dim.w / 2, curY);
    curY += nameSize * 0.72 + 10;

    // Handle
    if (data.handle) {
      const handleText = `>_ ${data.handle.startsWith('@') ? data.handle : `@${data.handle}`}`;
      ctx.font = '700 24px "JetBrains Mono", monospace';
      ctx.fillStyle = theme.accent;
      ctx.fillText(handleText, dim.w / 2, curY);
      curY += 36;
    }

    // Role & Track
    const roleText = data.role || event.defaultRole;
    const trackObj = event.tracks.find((t) => t.id === data.trackId);
    const trackText = trackObj ? `${trackObj.icon} ${trackObj.label}` : 'Google Cloud';

    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    const rW = ctx.measureText(roleText).width + 32;
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    const tW = ctx.measureText(trackText).width + 28;

    const totalPillsW = rW + tW + 16;
    let pillStartX = (dim.w - totalPillsW) / 2;

    drawRoundedRect(ctx, pillStartX, curY, rW, 40, 20);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'left';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(roleText, pillStartX + 16, curY + 26);

    drawRoundedRect(ctx, pillStartX + rW + 16, curY, tW, 40, 20);
    ctx.fillStyle = theme.pillBg;
    ctx.fill();
    ctx.strokeStyle = theme.pillBorder;
    ctx.stroke();
    ctx.fillStyle = theme.sub;
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(trackText, pillStartX + rW + 16 + 14, curY + 26);
    curY += 60;

    // Telemetry Matrix Bar in Creator mode
    const hashVal = generateShortHash(data.fullName || 'BUILDER');
    ctx.textAlign = 'center';
    ctx.font = '800 13px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.accent;
    ctx.fillText(`// PASS TIER: VIP • CREDENTIAL #${hashVal} • ALL-ACCESS //`, dim.w / 2, curY + 10);
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
  grad.addColorStop(0, theme.accent + '35');
  grad.addColorStop(1, theme.accent + '85');
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
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  ctx.font = `900 ${Math.floor(size * 0.42)}px "Plus Jakarta Sans", sans-serif`;
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
