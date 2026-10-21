import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import QRCode from 'qrcode';

export default function QrLabel({ productId, productName }) {
  const [image, setImage] = useState('');
  const [error, setError] = useState(false);
  const target = `${window.location.origin}/products/${productId}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(target, {
      errorCorrectionLevel: 'M',
      margin: 4,
      width: 256,
      color: { dark: '#20201c', light: '#ffffff' },
    }).then((url) => {
      if (active) setImage(url);
    }).catch(() => {
      if (active) setError(true);
    });
    return () => { active = false; };
  }, [target]);

  function download() {
    if (!image) return;
    const anchor = document.createElement('a');
    anchor.href = image;
    anchor.download = `${productName.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}-qr.png`;
    anchor.click();
  }

  return <section className="detail-panel qr-panel"><div><span className="section-kicker">SCAN TO OPEN THIS ITEM</span><h2>A label for its place</h2><p className="muted-copy">Print this QR label for the item or its storage box. Scanning opens this private record after sign-in.</p><button className="secondary-button" onClick={download} disabled={!image}><Download size={14}/> Download label</button>{error && <p role="alert">Could not generate this QR label.</p>}</div>{image ? <img className="item-qr" src={image} alt={`QR code for ${productName}`} /> : <span className="item-qr qr-loading" aria-label="Generating QR code"/>}</section>;
}
