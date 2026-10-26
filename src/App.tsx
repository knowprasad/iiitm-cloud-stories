import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Check, Cloud, Copy, ImagePlus, RotateCcw, Share2, ShieldCheck, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { moods, MoodId, storyCaption, storyEvent, templates, TemplateId } from './config/storyEvent';
import { loadLocalImage, renderStory, StoryData } from './engine/storyRenderer';
import { copyToClipboard, downloadBlob } from './utils/share';
import './story.css';

const initialFit = { zoom: 1, horizontal: .5, vertical: .5 };
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
    setError(false);
    onReady?.(false);
    onFileReady?.(null);
    renderStory(buffer, data).then(() => {
      if (!cancelled && canvas.current) {
        canvas.current.width = buffer.width;
        canvas.current.height = buffer.height;
        canvas.current.getContext('2d')?.drawImage(buffer, 0, 0);
        onReady?.(true);
        if (onFileReady && data.name.trim()) {
          buffer.toBlob(blob => {
            if (!cancelled && blob) onFileReady(new File([blob], `study-jams-${data.template}.png`, { type: 'image/png' }));
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

export function App() {
  const [template, setTemplate] = useState<TemplateId>('cloud-buddies');
  const [mood, setMood] = useState<MoodId>('curious');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [fit, setFit] = useState(initialFit);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const uploadId = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = templates.find(item => item.id === template)!;
  const selectedIndex = templates.findIndex(item => item.id === template);
  const data = useMemo(() => ({ template, mood, name, photo, ...fit, event: storyEvent }), [template, mood, name, photo, fit]);
  const ready = !!name.trim() && previewReady && !!shareFile && !loadingPhoto && !busy;

  function selectTemplate(id: TemplateId) { setTemplate(id); setStatus(''); }
  function cycleTemplate(direction: number) {
    selectTemplate(templates[(selectedIndex + direction + templates.length) % templates.length].id);
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
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
      if (id === uploadId.current) { setPhoto(image); setFit(initialFit); }
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
    // The PNG is prepared with the preview, so sharing starts inside the tap gesture.
    let fileSharingSupported = false;
    try { fileSharingSupported = !!navigator.share && !!navigator.canShare?.({ files: [shareFile] }); } catch { /* Use the download fallback if capability detection is blocked. */ }
    if (fileSharingSupported) {
      setBusy(true);
      try {
        await navigator.share({
          files: [shareFile], title: 'My Google Cloud Study Jams story',
          text: storyCaption(storyEvent),
        });
        setStatus('Card handed to your device’s share menu. Finish sharing in the app you choose.');
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setStatus('The share menu could not open. Download your story and add it in Instagram or WhatsApp.');
        }
      } finally { setBusy(false); }
    } else {
      downloadBlob(shareFile, shareFile.name);
      setStatus('Image sharing isn’t available in this browser, so your card was saved. Open Instagram or WhatsApp and add it from your photos or downloads.');
    }
  }

  return <div className={`story-app theme-${template}`}>
    <header className="site-header">
      <a className="wordmark" href={storyEvent.communityUrl} target="_blank" rel="noopener noreferrer" aria-label="Official GDG on Campus ABV-IIITM Gwalior chapter page (opens in a new tab)">
        <img src={storyEvent.logo} width="52" height="52" alt=""/>
        <span><strong>GDG on Campus</strong><small>{storyEvent.chapter}</small></span>
      </a>
      <span className="header-note"><Cloud size={17}/> Google Cloud Study Jams</span>
      <span className="campus-pill"><span/> Made for our campus</span>
    </header>
    <main>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-label"><Sparkles size={14}/> A LITTLE CURIOSITY. A LOT OF POSSIBILITIES.</div>
        <h1 id="page-title">Cloud curious. <span>Campus proud.<svg viewBox="0 0 210 14" aria-hidden="true"><path d="M3 10 Q90 -3 207 7"/></svg></span></h1>
        <p>Add your name, pick your vibe, and tell your people you’re joining.<br/>A little something for your story. Made right here at IIITM.</p>
        <span className="hero-doodle doodle-left" aria-hidden="true">✳</span>
        <span className="hero-doodle doodle-right" aria-hidden="true">✦</span>
      </section>
      <div className="studio">
        <section className="editor" aria-label="Make your story card">
          <div className="editor-heading"><h2>Make it yours.</h2><p>Your campus story starts here.</p></div>
          <div className="section-label"><span className="step">1</span><h2>Pick your kind of cloud.</h2><span className="quiet-label">3 little worlds</span></div>
          <div className="template-picker" role="group" aria-label="Story template">
            {templates.map((item, index) => <button key={item.id} className={`template-option ${template === item.id ? 'selected' : ''}`} aria-pressed={template === item.id} onClick={() => selectTemplate(item.id)}>
              <span className="template-art" style={{ backgroundColor: item.color }}><StoryCanvas data={thumbnailData[index]} label={`${item.name} template preview`}/><span className="template-check" aria-hidden="true"><Check size={12}/></span></span>
              <strong>{item.name}</strong>
            </button>)}
          </div>
          <div className="section-label second-step"><span className="step">2</span><h2>Make it a little more you.</h2></div>
          <label className="input-label" htmlFor="participant-name">Your name <span>the main character</span></label>
          <input id="participant-name" value={name} maxLength={60} placeholder="Your name goes here" autoComplete="name" onChange={e => { setName(e.target.value); setStatus(''); }}/>
          <div className="input-label photo-label">Your photo <span>totally optional</span></div>
          <input ref={fileInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose your photo" onChange={upload}/>
          <button className="photo-upload" disabled={loadingPhoto} onClick={() => fileInput.current?.click()}>
            <span className="upload-icon">{photo ? <Check size={22}/> : <ImagePlus size={22}/>}</span>
            <span><strong>{loadingPhoto ? 'Opening your photo…' : photo ? 'Nice photo. Want to change it?' : 'Put a face to the cloud'}</strong><small>JPG, PNG or WebP · up to 10 MB</small></span>
            <span className="upload-plus" aria-hidden="true">+</span>
          </button>
          {photo ? <details className="photo-adjust"><summary>Adjust your photo</summary>
            {(['zoom', 'horizontal', 'vertical'] as const).map(key => <label key={key}>{key === 'zoom' ? 'Zoom' : key === 'horizontal' ? 'Move left / right' : 'Move up / down'}<input type="range" min={key === 'zoom' ? 1 : 0} max={key === 'zoom' ? 3 : 1} step="0.01" value={fit[key]} onChange={e => setFit({ ...fit, [key]: Number(e.target.value) })}/></label>)}
            <div className="photo-tools"><button className="text-button" onClick={() => setFit(initialFit)}><RotateCcw size={13}/> Reset crop</button><button className="text-button" onClick={() => { setPhoto(null); setFit(initialFit); }}><X size={13}/> Remove photo</button></div>
          </details> : <p className="field-note">No photo? We’ll give your initials the spotlight.</p>}
          <fieldset className="mood-picker"><legend>Current mood <span>optional, but relatable</span></legend><div className="mood-options">
            {moods.map(item => <button key={item.id} aria-pressed={mood === item.id} onClick={() => setMood(mood === item.id ? '' : item.id)}><span aria-hidden="true">{item.symbol}</span>{item.label}</button>)}
          </div><p className="field-note">Tap your selected mood again to leave it off.</p></fieldset>
          <div className="export-actions">
            <button className="share-button" disabled={!ready} onClick={share}><Share2 size={17}/>{busy ? 'One little moment…' : 'Share my story'}</button>
            <button className="download-button" disabled={!ready} onClick={download}><ArrowDown size={17}/>Download PNG</button>
          </div>
          <p className="share-support">Share to the apps your device offers, or save the image to post yourself.</p>
          {!name.trim() && <p className="download-hint">Just add your name. We’ll take care of the rest.</p>}
          <p className="privacy"><ShieldCheck size={14}/> Your photo stays on your device. Always.</p>
          <p className="status" role="status" aria-live="polite">{status}</p>
        </section>
        <section className="preview-section" aria-label="Your story preview">
          <div className="preview-heading"><span><span className="live-dot"/> YOUR LITTLE CORNER OF THE CLOUD</span><span>9:16</span></div>
          <div className="preview-stage">
            <span className="preview-spark spark-one" aria-hidden="true">✦</span><span className="preview-spark spark-two" aria-hidden="true">✳</span>
            <div className="canvas-frame"><StoryCanvas data={data} label={`${selected.name} story card for ${name.trim() || 'your name'}: I’m joining Google Cloud Study Jams at ${storyEvent.chapter}`} onReady={setPreviewReady} onFileReady={setShareFile}/></div>
            {!photo && <button className="preview-upload" onClick={() => fileInput.current?.click()} disabled={loadingPhoto}><ImagePlus size={13}/>{loadingPhoto ? 'Opening…' : '+ Your photo'}</button>}
            <span className="preview-sticky" aria-hidden="true">yep, that’s you ↖</span>
          </div>
          <div className="preview-controls"><button aria-label="Previous template" onClick={() => cycleTemplate(-1)}><ArrowLeft size={16}/></button><span><strong>{selected.name}</strong><small>{selected.description}</small></span><button aria-label="Next template" onClick={() => cycleTemplate(1)}><ArrowRight size={16}/></button></div>
          <div className="share-note"><span aria-hidden="true">↗</span><p>Save it. Story it. Send it to your lab buddy.<br/><strong>Sharing is optional. Having fun is the point.</strong></p></div>
          <details className="caption"><summary>A caption, if you need one</summary><p>{storyCaption(storyEvent)}</p><button className="text-button" onClick={async () => setStatus(await copyToClipboard(storyCaption(storyEvent)) ? 'Caption copied. Go tell your people.' : 'Copy did not work. Select and copy the caption above.')}><Copy size={13}/> Copy caption</button></details>
        </section>
      </div>
    </main>
    {name.trim() && <div className="mobile-actions" aria-label="Quick story actions">
      <button className="quick-share" onClick={share} disabled={!ready}><Share2 size={17}/>Share my story</button>
      <button onClick={download} disabled={!ready}><ArrowDown size={17}/>Download</button>
    </div>}
    <footer className="site-footer">
      <span>Made with a little extra curiosity <span aria-hidden="true">✳</span></span>
      <nav className="social-links" aria-label="Our chapter online">
        <a href={`https://www.instagram.com/${storyEvent.instagram}/`} target="_blank" rel="noopener noreferrer">Instagram ↗</a>
        <a href={storyEvent.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
      </nav>
      <span>GDG on Campus · {storyEvent.chapter}</span>
    </footer>
  </div>;
}
