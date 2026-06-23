export default function LiveStreamModal({ match, isOpen, onClose }) {
  if (!isOpen) return null;

  const searchQuery = `${match.team1} ${match.team2}`;
  const streamUrl = `https://rojadirectastream.com/?s=${encodeURIComponent(searchQuery)}`;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />

      <div className="live-stream-modal">
        <div className="modal-header">
          <h3>🎬 {match.team1} vs {match.team2}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="stream-container">
            <iframe
              src={streamUrl}
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
          <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textAlign: 'center' }}>
            El sitio cargará con todos los canales disponibles para este partido. Si el iframe no funciona, abre en nueva pestaña.
          </p>
          <button
            onClick={() => window.open(streamUrl, '_blank')}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '1rem',
              background: 'var(--gold)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            Abrir en nueva pestaña
          </button>
        </div>
      </div>
    </>
  );
}
