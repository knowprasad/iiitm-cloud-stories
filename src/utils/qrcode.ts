import QRCode from 'qrcode';

export async function generateQrCodeDataUrl(text: string, color: string = '#000000', bgColor: string = '#ffffff'): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: color,
        light: bgColor,
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}
