import { useState } from 'react';

export default function LiveStreamModal({ match, isOpen, onClose }) {
  if (!isOpen) return null;

  // Construir URL del reproductor directo
  const getStreamUrl = () => {
    if (!match) return '';

    // Canales disponibles en orden de preferencia
    const channels = [
      'canal13',
      'canal94',
      'canal73',
      'canal56',
      'telemundo',
      'dazn-liga',
      'directv',
    ];

    // URL del reproductor directo de Roja Directa
    const selectedChannel = channels[0]; // Usar el primer canal disponible
    return `https://radamel.icu/reproductor/${selectedChannel}.php?width=700&height=438`;
  };

  const streamUrl = getStreamUrl();
  const rojaDirectaUrl = `https://www.rojadirectastream.blog/ver/canal-13.php`;

  return (
    <>
      {/* Overlay oscuro */}
      <div className="modal-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="live-stream-modal">
        <div className="modal-header">
          <h3>{match.team1} vs {match.team2}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="stream-container">
            <iframe
              src={streamUrl}
              title="Transmisión en vivo"
              allowFullScreen
              allow="autoplay"
            />
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-buttons">
            <p className="stream-info">
              Buscando: {match.team1} vs {match.team2}
            </p>
            <div className="button-group">
              <a
                href={rojaDirectaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link-btn"
              >
                Más canales en Roja Directa →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
