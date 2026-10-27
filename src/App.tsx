import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Cloud, Copy, ImagePlus, RotateCcw, Share2, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { moods, MoodId, storyCaption, storyEvent, templates, TemplateId } from './config/storyEvent';
import { loadLocalImage, renderStory, StoryData } from './engine/storyRenderer';
import { copyToClipboard, downloadBlob } from './utils/share';
import './story.css';

const initialFit = { zoom: 1, horizontal: .5, vertical: 0 };
type FrameFit = typeof initialFit;
const createFits = (image?: HTMLImageElement) => ({
  // Start tall portraits slightly wider so shallow frames do not cut into the face.
  'cloud-buddies': { ...initialFit, zoom: image && image.naturalHeight > image.naturalWidth ? .75 : 1 },
  'campus-scrapbook': { ...initialFit },
  'builder-mode': { ...initialFit, zoom: image && image.naturalHeight > image.naturalWidth ? .75 : 1 },
});
const thumbnailData = templates.map(template => ({
  template: template.id, mood: '' as const, name: 'You', photo: null,
  ...initialFit, event: storyEvent,
}));

function StoryCanvas({ data, label, onReady, onFileReady }: {
  data: StoryData; label: string; onReady?: (ready: boolean) => void;
  onFileReady?: (file: File | null) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const buffer = document.createElement('canvas');
    setError(false); onReady?.(false); onFileReady?.(null);
    renderStory(buffer, data).then(() => {
      if (!cancelled && canvas.current) {
        canvas.current.width = buffer.width;
        canvas.current.height = buffer.height;
        canvas.current.getContext('2d')?.drawImage(buffer, 0, 0);
        onReady?.(true);
        if (onFileReady && data.name.trim()) {
          buffer.toBlob(blob => {
            if (cancelled) return;
            if (blob) onFileReady(new File([blob], `study-jams-${data.template}.png`, { type: 'image/png' }));
            else { setError(true); onReady?.(false); }
          }, 'image/png');
        }
      }
    }).catch(() => { if (!cancelled) { setError(true); onReady?.(false); } });
    return () => { cancelled = true; };
  }, [data, onReady, onFileReady]);
  return <>
    <canvas ref={canvas} width="1080" height="1920" role="img" aria-label={label}/>
    {error && <span className="preview-error" role="alert">Preview unavailable. Refresh to try again.</span>}
  </>;
}

function PhotoCropDialog({ open, data, onClose, onFit, onReset, onTemplate }: {
  open: boolean; data: StoryData; onClose: () => void;
  onFit: (fit: Partial<FrameFit>) => void; onReset: () => void;
  onTemplate: (template: TemplateId) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  return <dialog ref={dialog} className="crop-dialog" aria-labelledby="crop-title" onCancel={onClose} onClose={onClose}>
    {open && <>
      <header className="crop-header"><div><h2 id="crop-title">Frame your photo</h2><p>This is how it will look on your card.</p></div><button className="icon-button" aria-label="Close photo adjustment" onClick={onClose}><X size={20}/></button></header>
      <div className="crop-layout">
        <div className="crop-preview"><StoryCanvas data={data} label="Live card preview while adjusting your photo"/></div>
        <div className="crop-controls">
          <label htmlFor="crop-template">Card style</label>
          <select id="crop-template" value={data.template} onChange={e => {
            const choice = templates.find(item => item.id === e.target.value);
            if (choice) onTemplate(choice.id);
          }}>{templates.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          {(['zoom', 'horizontal', 'vertical'] as const).map(key => <label className="crop-slider" key={key} htmlFor={`crop-${key}`}><span>{key === 'zoom' ? 'Zoom' : key === 'horizontal' ? 'Move left / right' : 'Move up / down'}<output>{key === 'zoom' ? `${data[key].toFixed(1)}×` : `${Math.round(data[key] * 100)}%`}</output></span><input id={`crop-${key}`} type="range" min={key === 'zoom' ? .5 : 0} max={key === 'zoom' ? 3 : 1} step="0.01" value={data[key]} onChange={e => onFit({ [key]: Number(e.target.value) })}/></label>)}
          <button className="reset-crop" onClick={onReset}><RotateCcw size={15}/>Reset this crop</button>
          <p className="crop-help">Each style remembers its own photo position. Switching styles won’t undo your other crops.</p>
        </div>
      </div>
      <button className="crop-done" onClick={onClose}><Check size={18}/>Done adjusting</button>
    </>}
  </dialog>;
}

export function App() {
  const [template, setTemplate] = useState<TemplateId>('cloud-buddies');
  const [mood, setMood] = useState<MoodId>('curious');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [fits, setFits] = useState(() => createFits());
  const [cropOpen, setCropOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const uploadId = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = templates.find(item => item.id === template)!;
  const selectedIndex = templates.findIndex(item => item.id === template);
  const fit = fits[template];
  const data = useMemo(() => ({ template, mood, name, photo, ...fit, event: storyEvent }), [template, mood, name, photo, fit]);
  const ready = !!name.trim() && previewReady && !!shareFile && !loadingPhoto && !busy;

  function selectTemplate(id: TemplateId) { setTemplate(id); setStatus(''); }
  function updateFit(update: Partial<FrameFit>) {
    setFits(previous => ({ ...previous, [template]: { ...previous[template], ...update } }));
  }
  function cycleTemplate(direction: number) {
    selectTemplate(templates[(selectedIndex + direction + templates.length) % templates.length].id);
  }
  async function copyCaption() {
    setStatus(await copyToClipboard(storyCaption(storyEvent)) ? 'Caption copied. Paste it alongside your card.' : 'Copy did not work. Open Preview caption below and copy the text.');
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setStatus('Choose a JPG, PNG, or WebP photo under 10 MB.'); return;
    }
    const id = ++uploadId.current;
    const url = URL.createObjectURL(file);
    setLoadingPhoto(true); setStatus('');
    try {
      const image = await loadLocalImage(url);
      if (image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error('Image too large');
      if (id === uploadId.current) { setPhoto(image); setFits(createFits(image)); setCropOpen(true); }
    } catch {
      if (id === uploadId.current) setStatus('This photo could not be opened. Try a smaller JPG, PNG, or WebP.');
    } finally {
      URL.revokeObjectURL(url);
      if (id === uploadId.current) setLoadingPhoto(false);
    }
  }

  async function download() {
    if (!ready || !shareFile) return;
    setBusy(true); setStatus('');
    try {
      downloadBlob(shareFile, shareFile.name);
      setStatus('Saved! Add your card to Instagram stories or WhatsApp status if you’d like.');
      void confetti({ particleCount: 45, spread: 50, origin: { y: .78 }, colors: ['#4285f4', '#ea4335', '#fbbc04', '#34a853'], disableForReducedMotion: true });
    } catch { setStatus('The image could not be downloaded. Please try again.'); }
    finally { setBusy(false); }
  }

  async function share() {
    if (!ready || !shareFile) return;
    setStatus('');
    let fileSharingSupported = false;
    try { fileSharingSupported = !!navigator.share && !!navigator.canShare?.({ files: [shareFile] }); } catch { /* Use the download fallback if capability detection is blocked. */ }
    if (fileSharingSupported) {
      setBusy(true);
      try {
        await navigator.share({ files: [shareFile], title: 'My Google Cloud Study Jams story', text: storyCaption(storyEvent) });
        setStatus('Card handed to your device’s share menu. Finish sharing in the app you choose.');
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('The share menu could not open. Download your story and add it in Instagram or WhatsApp.');
      } finally { setBusy(false); }
    } else {
      downloadBlob(shareFile, shareFile.name);
      setStatus('Image sharing isn’t available in this browser, so your card was saved. Open Instagram or WhatsApp and add it from your photos or downloads.');
    }
  }

  return <div className={`story-app theme-${template}`}>
    <header className="site-header">
      <a className="wordmark" href={storyEvent.communityUrl} target="_blank" rel="noopener noreferrer" aria-label="Official GDG on Campus ABV-IIITM Gwalior chapter page (opens in a new tab)"><img src={storyEvent.logo} width="52" height="52" alt=""/><span><strong>GDG on Campus</strong><small>{storyEvent.chapter}</small></span></a>
      <span className="header-note"><Cloud size={17}/> Google Cloud Study Jams</span>
      <span className="campus-pill"><span/> Made for our campus</span>
    </header>
    <main>
      <section className="hero" aria-labelledby="page-title">
        <h1 id="page-title">Cloud curious. <span>Campus proud.<svg viewBox="0 0 210 14" aria-hidden="true"><path d="M3 10 Q90 -3 207 7"/></svg></span></h1>
        <p>Make your Google Cloud Study Jams story. Add your name to start.</p>
        <div className="quick-start"><label htmlFor="participant-name">Your name</label><input id="participant-name" value={name} maxLength={60} placeholder="Your name goes here" autoComplete="name" aria-describedby="name-help" onChange={e => { setName(e.target.value); setStatus(''); }}/><div className="start-help"><span id="name-help">A photo is optional.</span><a href="#customize">Choose style & photo <ArrowDown size={14}/></a></div></div>
      </section>
      <div className="studio">
        <section className="preview-section" id="story-preview" aria-label="Your story preview">
          <div className="preview-heading"><h2>Your story</h2><span>1080 × 1920 PNG</span></div>
          <div className="preview-stage">
            <div className="canvas-frame"><StoryCanvas data={data} label={`${selected.name} story card for ${name.trim() || 'your name'}: I’m joining Google Cloud Study Jams at ${storyEvent.chapter}`} onReady={setPreviewReady} onFileReady={setShareFile}/></div>
            <button className="preview-upload" onClick={() => photo ? setCropOpen(true) : fileInput.current?.click()} disabled={loadingPhoto}>{photo ? <SlidersHorizontal size={15}/> : <ImagePlus size={15}/>} {loadingPhoto ? 'Opening…' : photo ? 'Adjust photo' : 'Add your photo · optional'}</button>
          </div>
          <div className="preview-controls"><button aria-label="Previous template" onClick={() => cycleTemplate(-1)}><ArrowLeft size={16}/></button><span><strong>{selected.name}</strong><small>{selected.description}</small></span><button aria-label="Next template" onClick={() => cycleTemplate(1)}><ArrowRight size={16}/></button></div>
        </section>
        <section className="editor" id="customize" aria-label="Customize and share your story card">
          <div className="editor-heading"><h2>Make it yours.</h2><p>Pick a style, add a photo if you like, then share.</p></div>
          <div className="section-label"><h3>Card style</h3><span className="quiet-label">Three ways to say “I’m joining”</span></div>
          <div className="template-picker" role="group" aria-label="Story template">{templates.map((item, index) => <button key={item.id} className={`template-option ${template === item.id ? 'selected' : ''}`} aria-pressed={template === item.id} onClick={() => selectTemplate(item.id)}><span className="template-art" style={{ backgroundColor: item.color }}><StoryCanvas data={thumbnailData[index]} label={`${item.name} template preview`}/><span className="template-check" aria-hidden="true"><Check size={12}/></span></span><strong>{item.name}</strong></button>)}</div>
          <a className="view-card-link" href="#story-preview">View your selected card <ArrowUp size={14}/></a>
          <div className="input-label photo-label">Your photo <span>Optional</span></div>
          <input ref={fileInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose your photo" onChange={upload}/>
          <button className="photo-upload" disabled={loadingPhoto} onClick={() => fileInput.current?.click()}><span className="upload-icon">{photo ? <Check size={22}/> : <ImagePlus size={22}/>}</span><span><strong>{loadingPhoto ? 'Opening your photo…' : photo ? 'Change photo' : 'Add your photo'}</strong><small>JPG, PNG or WebP · up to 10 MB</small></span></button>
          {photo ? <div className="photo-tools"><button className="text-button" onClick={() => setCropOpen(true)}><SlidersHorizontal size={15}/>Adjust photo</button><button className="text-button" onClick={() => { setPhoto(null); setFits(createFits()); }}><X size={15}/>Remove photo</button></div> : <p className="field-note">No photo? Your initials are part of the design.</p>}
          <fieldset className="mood-picker"><legend>Mood sticker <span>Optional</span></legend><div className="mood-options">{moods.map(item => <button key={item.id} aria-pressed={mood === item.id} onClick={() => setMood(mood === item.id ? '' : item.id)}><span aria-hidden="true">{item.symbol}</span>{item.label}</button>)}</div><p className="field-note">Tap the selected mood again to remove it.</p></fieldset>
          <div className="export-panel"><h3>Share your story</h3><p>For Instagram stories, WhatsApp status, or your lab buddy.</p><div className="export-actions"><button className="share-button" disabled={!ready} onClick={share}><Share2 size={17}/>{busy ? 'One little moment…' : 'Share my story'}</button><button className="download-button" disabled={!ready} onClick={download}><ArrowDown size={17}/>Download PNG</button></div><button className="caption-button" onClick={copyCaption}><Copy size={17}/><span>Copy caption<small>Includes @{storyEvent.instagram}</small></span></button><details className="caption-preview"><summary>Preview caption</summary><p>{storyCaption(storyEvent)}</p></details><p className="share-support">The share menu depends on your device. Download always works.</p>{!name.trim() ? <p className="download-hint"><a href="#participant-name">Add your name above</a> to enable sharing and download.</p> : !shareFile && !busy && !loadingPhoto ? <p className="render-pending">Preparing your card…</p> : null}</div>
          <p className="privacy"><ShieldCheck size={15}/> Your photo stays on your device.</p><p className="status" role="status" aria-live="polite">{status}</p>
        </section>
      </div>
    </main>
    <PhotoCropDialog open={cropOpen && !!photo} data={data} onClose={() => setCropOpen(false)} onFit={updateFit} onReset={() => updateFit(createFits(photo ?? undefined)[template])} onTemplate={selectTemplate}/>
    {name.trim() && <div className="mobile-actions" aria-label="Quick story actions"><button className="quick-share" onClick={share} disabled={!ready}><Share2 size={17}/>Share</button><button onClick={download} disabled={!ready}><ArrowDown size={17}/>Download</button><button onClick={copyCaption}><Copy size={17}/>Caption</button></div>}
    <footer className="site-footer"><span>Made with a little extra curiosity.</span><nav className="social-links" aria-label="Our chapter online"><a href={`https://www.instagram.com/${storyEvent.instagram}/`} target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href={storyEvent.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></nav><span>GDG on Campus · {storyEvent.chapter}</span></footer>
  </div>;
}

