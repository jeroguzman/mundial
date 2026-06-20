import logo from '../assets/logo.png';

export default function Header({ isLive, viewMode, onViewChange }) {
  return (
    <header className="top">
      <div className="top-inner">
        <div className="brand">
          <img src={logo} alt="Mundial 2026" className="logo" />
        </div>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'groups' ? 'active' : ''}`}
            onClick={() => onViewChange('groups')}
          >
            Grupos
          </button>
          <button
            className={`view-btn ${viewMode === 'bracket' ? 'active' : ''}`}
            onClick={() => onViewChange('bracket')}
          >
            Eliminatorias
          </button>
        </div>
        <div className="live-pill">
          <span className="live-dot"></span>
          <span id="liveLabel">{isLive ? 'En vivo' : 'Caché'}</span>
        </div>
      </div>
    </header>
  );
}
