export default function Hero({ timestamp, isLive, phase }) {
  const eyebrowText = isLive
    ? `${phase} · En vivo · ${timestamp}`
    : `${phase} · Sin conexión · mostrando último dato guardado`;

  return (
    <section className="hero">
      <div className="eyebrow">{eyebrowText}</div>
      <h1>
        Estadísticas
        <br />
        Mundial 2026
      </h1>
      <p className="sub">
        Los 12 grupos del torneo más grande de la historia, con 48 selecciones. Clasifican el
        1.º y 2.º de cada grupo, más los 8 mejores terceros.
      </p>

      <div className="stat-row">
        <div className="stat">
          <div className="n">48</div>
          <div className="l">Selecciones</div>
        </div>
        <div className="stat">
          <div className="n">32</div>
          <div className="l">Avanzan a 16vos</div>
        </div>
        <div className="stat">
          <div className="n">104</div>
          <div className="l">Partidos totales</div>
        </div>
      </div>
    </section>
  );
}
