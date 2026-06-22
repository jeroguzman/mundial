import { useState, useRef, useEffect } from 'react';

const STREAM_SOURCES = [
  { id: 'canal13', name: 'Canal 13', quality: 'HD' },
  { id: 'canal94', name: 'Canal 94', quality: 'HD' },
  { id: 'canal73', name: 'Canal 73', quality: 'HD' },
  { id: 'canal56', name: 'Canal 56', quality: 'HD' },
  { id: 'telemundo', name: 'Telemundo', quality: 'HD' },
  { id: 'dazn-liga', name: 'DAZN Liga', quality: 'Full HD' },
  { id: 'directv', name: 'DirecTV', quality: 'HD' },
  { id: 'espn-plus', name: 'ESPN Plus', quality: 'HD' },
];

const AD_BLOCKER_RULES = `
(function() {
  // Bloquear publicidad agresivamente
  const blockAds = () => {
    // Bloquear por atributo de datos
    document.querySelectorAll('[data-ad-type], [data-advertisement-slot], [class*="google_ads"], [id*="google_ads"]').forEach(el => {
      el.remove();
    });

    // Bloquear por estructura DOM
    document.querySelectorAll('div[class*="ad-"], div[id*="ad-"], ins.adsbygoogle, .adsbygoogle').forEach(el => {
      el.remove();
    });

    // Bloquear iframes sospechosos
    document.querySelectorAll('iframe').forEach(iframe => {
      const src = (iframe.src || '').toLowerCase();
      if (src.includes('ad') || src.includes('banner') || src.includes('tracking')) {
        iframe.remove();
      }
    });

    // Ocultar con CSS
    const style = document.createElement('style');
    style.textContent = '[class*="ad-"] { display: none !important; } [id*="ad-"] { display: none !important; } .adsbygoogle { display: none !important; }';
    document.head.appendChild(style);
  };

  blockAds();
  setInterval(blockAds, 1000);

  new MutationObserver(blockAds).observe(document.body, { childList: true, subtree: true });
})();
`;

export default function LiveStreamModal({ match, isOpen, onClose }) {
  const [selectedSource, setSelectedSource] = useState('roja-directa-1');
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current || !isOpen) return;

    // Inyectar bloqueador de ads
    const injectBlocker = () => {
      try {
        const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
        if (!doc) return;

        const script = doc.createElement('script');
        script.textContent = AD_BLOCKER_RULES;
        doc.head.appendChild(script);
      } catch (e) {
        // CORS, no se puede acceder
      }
    };

    const timer = setTimeout(injectBlocker, 1000);
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', injectBlocker);
    }

    return () => {
      clearTimeout(timer);
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', injectBlocker);
      }
    };
  }, [selectedSource, isOpen]);

  if (!isOpen) return null;

  const currentSource = STREAM_SOURCES.find(s => s.id === selectedSource);

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />

      <div className="live-stream-modal">
        <div className="modal-header">
          <h3>{match.team1} vs {match.team2}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Selector de canales */}
        <div className="channels-selector">
          <div className="channels-label">📺 Selecciona un canal:</div>
          <div className="channels-list">
            {STREAM_SOURCES.map((channel) => (
              <button
                key={channel.id}
                className={`channel-btn ${selectedSource === channel.id ? 'active' : ''}`}
                onClick={() => setSelectedSource(channel.id)}
              >
                <span className="channel-name">{channel.name}</span>
                <span className="channel-quality">{channel.quality}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body">
          <div className="stream-container">
            <iframe
              ref={iframeRef}
              src={`https://radamel.icu/reproductor/${selectedSource}.php?width=700&height=438`}
              title={`Transmisión en vivo - ${match.team1} vs ${match.team2}`}
              allowFullScreen
              allow="autoplay; picture-in-picture; encrypted-media; accelerometer; clipboard-write; gyroscope"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-buttons">
            <p className="stream-info">
              🎬 {STREAM_SOURCES.find(c => c.id === selectedSource)?.name} | {match.team1} vs {match.team2}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.5rem' }}>
              Si el reproductor no funciona, intenta cambiar de canal
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
