import { MoodId, moods, StoryEvent, TemplateId } from '../config/storyEvent';
import { layoutName } from './nameLayout';

export interface StoryData {
  template: TemplateId;
  mood: MoodId;
  name: string;
  photo: HTMLImageElement | null;
  zoom: number;
  horizontal: number;
  vertical: number;
  event: StoryEvent;
}
export const STORY_SIZE = { width: 1080, height: 1920 };
const BODY = '"Plus Jakarta Sans", sans-serif';
const ROUND = '"Fredoka", sans-serif';
const HAND = '"Caveat", cursive';
const MONO = '"JetBrains Mono", monospace';

export function loadLocalImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image could not be read'));
    image.src = url;
  });
}
const logos = new Map<string, Promise<HTMLImageElement>>();
function loadLogo(url: string) {
  let pending = logos.get(url);
  if (!pending) {
    pending = loadLocalImage(url).catch(error => { logos.delete(url); throw error; });
    logos.set(url, pending);
  }
  return pending;
}

class StoryDrawing {
  constructor(readonly c: CanvasRenderingContext2D, readonly data: StoryData, readonly logo: HTMLImageElement) {}

  text(value: string, x: number, y: number, size: number, color: string, family = BODY, weight = 700, max = 900) {
    const c = this.c;
    let fitted = size;
    c.font = `${weight} ${fitted}px ${family}`;
    while (c.measureText(value).width > max && fitted > 16) c.font = `${weight} ${--fitted}px ${family}`;
    c.fillStyle = color;
    c.fillText(value, x, y, max);
  }
  name(x: number, y: number, width: number, size: number, color: string, family = BODY) {
    const c = this.c;
    const layout = layoutName(this.data.name, width, size, (value, fontSize) => {
      c.font = '600 ' + fontSize + 'px ' + family;
      return c.measureText(value).width;
    });
    c.save(); c.textAlign = 'center';
    const firstBaseline = y - (layout.lines.length - 1) * layout.lineHeight / 2;
    layout.lines.forEach((line, i) => this.text(line, x, firstBaseline + i * layout.lineHeight, layout.fontSize, color, family, 600, width));
    c.restore();
  }
  rect(x: number, y: number, w: number, h: number, color: string, radius = 0) {
    this.c.beginPath(); this.c.roundRect(x, y, w, h, radius);
    this.c.fillStyle = color; this.c.fill();
  }
  circle(x: number, y: number, r: number, color: string) {
    this.c.beginPath(); this.c.arc(x, y, r, 0, Math.PI * 2); this.c.fillStyle = color; this.c.fill();
  }
  star(x: number, y: number, r: number, color: string, rotation = 0) {
    const c = this.c;
    c.save(); c.translate(x, y); c.rotate(rotation); c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4; const d = i % 2 ? r * .3 : r;
      c.lineTo(Math.cos(a) * d, Math.sin(a) * d);
    }
    c.closePath(); c.fillStyle = color; c.fill(); c.restore();
  }
  cloudPath(x: number, y: number, w: number, h: number) {
    const c = this.c;
    c.beginPath(); c.moveTo(x + w * .2, y + h * .94);
    c.bezierCurveTo(x - w * .14, y + h * .98, x - w * .09, y + h * .43, x + w * .15, y + h * .42);
    c.bezierCurveTo(x + w * .08, y + h * .04, x + w * .46, y - h * .08, x + w * .57, y + h * .18);
    c.bezierCurveTo(x + w * .72, y - h * .02, x + w * .98, y + h * .14, x + w * .93, y + h * .42);
    c.bezierCurveTo(x + w * 1.18, y + h * .49, x + w * 1.13, y + h * .97, x + w * .85, y + h * .94);
    c.closePath();
  }
  cloud(x: number, y: number, w: number, h: number, color: string, smile = false) {
    const c = this.c;
    this.cloudPath(x, y, w, h); c.fillStyle = color; c.fill();
    if (smile) {
      this.circle(x + w * .42, y + h * .6, w * .018, '#304a71');
      this.circle(x + w * .62, y + h * .6, w * .018, '#304a71');
      c.beginPath(); c.arc(x + w * .52, y + h * .62, w * .055, .1, Math.PI - .1);
      c.strokeStyle = '#304a71'; c.lineWidth = Math.max(3, w * .012); c.stroke();
      this.circle(x + w * .32, y + h * .69, w * .04, '#ffd4de');
      this.circle(x + w * .73, y + h * .69, w * .04, '#ffd4de');
    }
  }
  portrait(x: number, y: number, w: number, h: number, bg: string, ink: string) {
    const c = this.c, d = this.data;
    c.fillStyle = bg; c.fillRect(x, y, w, h);
    if (d.photo) {
      const scale = Math.max(w / d.photo.naturalWidth, h / d.photo.naturalHeight) * d.zoom;
      const pw = d.photo.naturalWidth * scale, ph = d.photo.naturalHeight * scale;
      c.drawImage(d.photo, x + (w - pw) * d.horizontal, y + (h - ph) * d.vertical, pw, ph);
    } else {
      const initials = d.name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0] || '').join('').toLocaleUpperCase() || 'YOU';
      c.save(); c.textAlign = 'center';
      this.text(initials, x + w / 2, y + h * .56, Math.min(w, h) * .29, ink, ROUND, 500, w * .8);
      this.star(x + w * .22, y + h * .25, 20, ink, .2);
      this.star(x + w * .79, y + h * .73, 15, ink, .2);
      c.restore();
    }
  }
  brand(dark = false) {
    const c = this.c;
    c.save();
    c.beginPath(); c.arc(151, 211, 66, 0, Math.PI * 2); c.clip();
    c.drawImage(this.logo, 82, 142, 138, 138); c.restore();
    this.text('GDG on Campus', 245, 197, 34, dark ? '#d6e2ff' : '#445474', BODY, 600, 700);
    this.text(this.data.event.chapter, 245, 251, 46, dark ? '#ffffff' : '#243457', BODY, 800, 735);
  }
  mood(y: number, dark = false) {
    const mood = moods.find(item => item.id === this.data.mood);
    if (!mood) return;
    const c = this.c;
    c.save(); c.font = `600 36px ${BODY}`;
    const value = `${mood.symbol}  ${mood.label}`;
    const width = c.measureText(value).width + 65;
    this.rect((1080 - width) / 2, y - 45, width, 75, dark ? '#dafa80' : '#ffffff', 35);
    c.textAlign = 'center'; this.text(value, 540, y, 36, '#28365a', BODY, 600, 750); c.restore();
  }
  footer(dark = false) {
    const c = this.c;
    c.save(); c.textAlign = 'center';
    const tag = this.data.event.instagram.trim().replace(/^@/, '');
    this.text('See you at Study Jams.', 540, 1650, 34, dark ? '#d6e2ff' : '#445474', BODY, 500);
    this.text(tag ? `@${tag}` : '#GoogleCloudStudyJams', 540, 1718, 48, dark ? '#ffffff' : '#243457', BODY, 700);
    c.restore();
  }
  clouds() {
    const c = this.c;
    this.rect(0, 0, 1080, 1920, '#e5f3ff');
    c.save(); c.globalAlpha = .3;
    for (let x = 35; x < 1080; x += 55) for (let y = 35; y < 1920; y += 55) this.circle(x, y, 1.8, '#a2c6ea');
    c.restore();
    this.cloud(-80, 285, 260, 145, '#ffffff');
    this.cloud(890, 560, 240, 140, '#ffffff', true);
    this.brand();
    c.textAlign = 'center';
    this.text("I'm joining", 540, 386, 58, '#365884', BODY, 600);
    this.text('Google Cloud', 540, 503, 96, '#24497e', ROUND, 600);
    this.text('Study Jams', 540, 616, 104, '#24497e', ROUND, 600);
    this.star(122, 566, 35, '#f8c64c', -.15);
    c.save(); c.translate(540, 1020); c.rotate(-.04); c.translate(-540, -1020);
    this.cloudPath(224, 738, 620, 525); c.fillStyle = '#ffffff'; c.fill();
    c.lineWidth = 24; c.strokeStyle = '#ffffff'; c.stroke(); c.clip();
    this.portrait(164, 730, 755, 540, '#c4e1f9', '#3d659b'); c.restore();
    this.cloud(74, 1164, 205, 125, '#ffffff', true);
    this.star(903, 1170, 49, '#f8c64c', .13);
    this.star(848, 1258, 21, '#fb9cb9');
    c.textAlign = 'center';
    this.name(540, 1405, 900, 90, '#24497e', ROUND);
    this.mood(1560); this.footer();
    this.cloud(-105, 1800, 600, 220, '#ffffff');
    this.cloud(655, 1790, 570, 240, '#d1e9fc');
  }
  scrapbook() {
    const c = this.c;
    this.rect(0, 0, 1080, 1920, '#fff6dc');
    c.strokeStyle = '#e8dcbf'; c.lineWidth = 1;
    for (let x = 0; x < 1080; x += 48) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1920); c.stroke(); }
    for (let y = 0; y < 1920; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(1080, y); c.stroke(); }
    this.brand();
    c.save(); c.translate(540, 415); c.rotate(-.035); c.textAlign = 'center';
    this.rect(-290, -102, 580, 72, '#f8c9d8', 4);
    this.text("I'm joining", 0, -48, 55, '#603d51', HAND, 700);
    this.text('Google Cloud', 0, 72, 88, '#333d62', BODY, 800);
    this.text('Study Jams', 0, 173, 96, '#333d62', BODY, 800); c.restore();
    c.save(); c.translate(540, 977); c.rotate(.055);
    c.shadowColor = '#735a3b26'; c.shadowBlur = 30; c.shadowOffsetY = 14;
    this.rect(-357, -355, 714, 720, '#ffffff', 5); c.shadowColor = 'transparent';
    c.save(); this.rect(-325, -322, 650, 600, '#e6d9ef'); c.clip();
    this.portrait(-325, -322, 650, 600, '#e5dcf2', '#6d5a8b'); c.restore();
    c.textAlign = 'center'; this.text('my cloud era, with my campus.', 0, 333, 38, '#55617d', HAND, 600, 650);
    c.restore();
    c.save(); c.translate(505, 630); c.rotate(-.1); c.globalAlpha = .85;
    this.rect(-155, -36, 310, 72, '#f3d16b'); c.restore();
    c.save(); c.translate(887, 1235); c.rotate(.12);
    this.rect(-106, -43, 212, 84, '#c9dfb4', 5); c.textAlign = 'center';
    this.text('let’s do this!', 0, 15, 36, '#3d6142', HAND, 700, 190); c.restore();
    this.star(145, 828, 51, '#ed8daf', .2); this.star(930, 575, 56, '#a99cd8', .15);
    c.save(); c.translate(115, 1300); c.rotate(-.18); c.strokeStyle = '#4c83ce'; c.lineWidth = 6;
    c.beginPath(); c.arc(0, 0, 55, 0, Math.PI * 2); c.stroke();
    this.circle(-17, -9, 5, '#4c83ce'); this.circle(17, -9, 5, '#4c83ce');
    c.beginPath(); c.arc(0, 2, 25, .1, Math.PI - .1); c.stroke(); c.restore();
    this.name(540, 1430, 900, 84, '#334266');
    this.mood(1570); this.footer();
    this.rect(70, 1825, 165, 13, '#4285f4'); this.rect(235, 1825, 165, 13, '#ea4335');
    this.rect(400, 1825, 165, 13, '#fbbc04'); this.rect(565, 1825, 165, 13, '#34a853');
  }
  builder() {
    const c = this.c;
    this.rect(0, 0, 1080, 1920, '#2856ed');
    c.save(); c.globalAlpha = .12; c.strokeStyle = '#ffffff'; c.lineWidth = 1.5;
    for (let x = 0; x <= 1080; x += 90) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1920); c.stroke(); }
    for (let y = 0; y <= 1920; y += 90) { c.beginPath(); c.moveTo(0, y); c.lineTo(1080, y); c.stroke(); }
    c.restore(); this.brand(true);
    this.text("I'M JOINING", 90, 365, 50, '#dafa80', BODY, 700);
    this.text('Google Cloud', 83, 483, 94, '#ffffff', BODY, 800);
    this.text('Study Jams', 83, 597, 104, '#ffffff', BODY, 800);
    this.star(944, 578, 47, '#dafa80', .25);
    c.save(); c.translate(540, 1030); c.rotate(-.022);
    this.rect(-455, -365, 910, 850, '#142964', 22);
    this.circle(-409, -324, 9, '#fc9292'); this.circle(-379, -324, 9, '#f8d26f'); this.circle(-349, -324, 9, '#b4e88c');
    this.text('IIITM / CLOUD CREW', -295, -313, 28, '#d2dcff', MONO, 500, 680);
    c.save(); this.rect(-425, -280, 850, 550, '#bed7ff', 6); c.clip();
    this.portrait(-425, -280, 850, 550, '#b8d4ff', '#315aa5'); c.restore();
    this.name(0, 395, 820, 78, '#ffffff');
    c.restore();
    c.save(); c.translate(932, 639); c.rotate(.13); this.rect(-91, -38, 182, 76, '#ffbdce', 4);
    c.textAlign = 'center'; this.text('LET’S GO ↗', 0, 12, 24, '#273c77', MONO, 700, 165); c.restore();
    this.mood(1560, true); this.footer(true);
    this.text('{ curiosity: true }', 90, 1820, 23, '#b7caff', MONO, 500);
  }
}

export async function renderStory(canvas: HTMLCanvasElement, data: StoryData): Promise<void> {
  // Offline or blocked Google Fonts should still permit system-font exports.
  await Promise.allSettled([
    document.fonts.load(`600 40px ${ROUND}`), document.fonts.load(`700 40px ${HAND}`),
    document.fonts.load(`800 40px ${BODY}`), document.fonts.load(`500 24px ${MONO}`),
    document.fonts.load(`600 40px ${BODY}`),
  ]);
  const logo = await loadLogo(data.event.logo);
  canvas.width = STORY_SIZE.width; canvas.height = STORY_SIZE.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');
  const drawing = new StoryDrawing(ctx, data, logo);
  switch (data.template) {
    case 'cloud-buddies': drawing.clouds(); break;
    case 'campus-scrapbook': drawing.scrapbook(); break;
    case 'builder-mode': drawing.builder(); break;
  }
}
