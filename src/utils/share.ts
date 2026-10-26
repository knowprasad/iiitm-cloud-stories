/**
 * Utility functions for sharing, downloading, and clipboard interactions.
 */

export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
  blob?: Blob;
  fileName?: string;
}

export async function shareBadge(options: ShareOptions): Promise<{ shared: boolean; method: 'web-share-file' | 'web-share-text' | 'download-fallback' }> {
  const { title, text, url = window.location.href, blob, fileName = 'google-cloud-study-jams-badge.png' } = options;

  // 1. Try Web Share API with File
  if (blob && navigator.canShare && typeof File !== 'undefined') {
    const file = new File([blob], fileName, { type: blob.type || 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title,
          text,
          files: [file],
        });
        return { shared: true, method: 'web-share-file' };
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { shared: false, method: 'web-share-file' };
        }
        console.warn('File share failed, falling back to text share', err);
      }
    }
  }

  // 2. Try standard Web Share API with text & url
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { shared: true, method: 'web-share-text' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { shared: false, method: 'web-share-text' };
      }
      console.warn('Web share failed, falling back to download', err);
    }
  }

  // 3. Fallback: Trigger download directly
  if (blob) {
    downloadBlob(blob, fileName);
  }
  return { shared: true, method: 'download-fallback' };
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Failed to copy text', err);
    return false;
  }
}

export function getLinkedInShareUrl(caption: string, _url: string = typeof window !== 'undefined' ? window.location.href : ''): string {
  // LinkedIn feed sharing intent
  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(caption)}`;
}

export function getXShareUrl(caption: string, url: string = typeof window !== 'undefined' ? window.location.href : ''): string {
  // Twitter / X tweet intent
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(url)}`;
}
