export default function Hero({ timestamp, isLive }) {
  const eyebrowText = isLive
    ? `Fase de grupos · En vivo · ${timestamp}`
    : 'Fase de grupos · Sin conexión · mostrando último dato guardado';

  return (
    <section className="hero">
      <div className="eyebrow">{eyebrowText}</div>
      <h1>
        Tabla de
        <br />
        posiciones<span className="accent">.</span>
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
