export default function Header({ isLive }) {
  return (
    <header className="top">
      <div className="top-inner">
        <div className="brand">
          <span className="mark">MUNDIAL</span>
          <span className="yr">2026</span>
        </div>
        <div className="live-pill">
          <span className="live-dot"></span>
          <span id="liveLabel">{isLive ? 'En vivo' : 'Caché'}</span>
        </div>
      </div>
    </header>
  );
}
