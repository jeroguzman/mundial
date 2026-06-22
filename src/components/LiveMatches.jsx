import { useState, useEffect } from 'react';
import { getCountryFlag } from '../utils/countryFlags';
import LiveStreamModal from './LiveStreamModal';

const SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300';

function extractLiveMatches(events) {
  const liveMatches = [];

  for (const event of events || []) {
    const comp = event.competitions && event.competitions[0];
    if (!comp) continue;

    const status = comp.status && comp.status.type;
    if (!status) continue;

    // Detectar partidos en vivo: primer tiempo, segundo tiempo, o "in progress"
    const isLive = status.name && (
      status.name.includes('FIRST_HALF') ||
      status.name.includes('SECOND_HALF') ||
      status.name.toLowerCase().includes('in progress') ||
      status.name.toLowerCase().includes('inprogress') ||
      status.name.toLowerCase().includes('live')
    );

    if (!isLive) continue;

    const [a, b] = comp.competitors || [];
    if (!a || !b) continue;

    const sa = parseInt(a.score, 10);
    const sb = parseInt(b.score, 10);

    if (isNaN(sa) || isNaN(sb)) continue;

    // Extraer el minuto del detalle del estado
    let minute = status.detail || '...';
    if (!minute || minute === 'null') {
      // Mostrar el periodo si no hay detalle de minuto
      if (status.name.includes('FIRST_HALF')) {
        minute = 'Primer tiempo';
      } else if (status.name.includes('SECOND_HALF')) {
        minute = 'Segundo tiempo';
      } else {
        minute = 'En vivo';
      }
    }

    liveMatches.push({
      id: event.id,
      team1: a.team.displayName,
      team2: b.team.displayName,
      score1: sa,
      score2: sb,
      minute: minute,
      startTime: event.date,
    });
  }

  return liveMatches;
}

export default function LiveMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const loadLiveMatches = async () => {
      try {
        const res = await fetch(SCOREBOARD_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('http ' + res.status);
        const json = await res.json();
        const live = extractLiveMatches(json.events || []);
        setMatches(live);

        const now = new Date();
        const stamp = now.toLocaleString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setLastUpdate(stamp);
      } catch (err) {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadLiveMatches();
    const interval = setInterval(loadLiveMatches, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="live-matches-section">
        <h2>Partidos en vivo</h2>
        <div className="live-matches-empty">Cargando...</div>
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section className="live-matches-section">
        <h2>Partidos en vivo</h2>
        <div className="live-matches-empty">No hay partidos en vivo en este momento</div>
      </section>
    );
  }

  return (
    <section className="live-matches-section">
      <div className="live-matches-header">
        <h2>Partidos en vivo</h2>
        <span className="last-update">Actualizado: {lastUpdate}</span>
      </div>

      <div className="live-matches-grid">
        {matches.map((match) => {
          const flag1 = getCountryFlag(match.team1);
          const flag2 = getCountryFlag(match.team2);
          return (
            <div key={match.id} className="live-match-card">
              <div className="live-badge">EN VIVO</div>

              <div className="match-teams">
                <div className="match-team">
                  <span className="team-flag">{flag1}</span>
                  <span className="team-name">{match.team1}</span>
                </div>

                <div className="match-score">
                  <div className="score-display">
                    <span className="goal">{match.score1}</span>
                    <span className="separator">-</span>
                    <span className="goal">{match.score2}</span>
                  </div>
                  <div className="match-minute">{match.minute}</div>
                </div>

                <div className="match-team">
                  <span className="team-name">{match.team2}</span>
                  <span className="team-flag">{flag2}</span>
                </div>
              </div>

              <button
                className="watch-live-btn"
                onClick={() => setSelectedMatch(match)}
              >
                Ver en vivo
              </button>
            </div>
          );
        })}
      </div>

      <LiveStreamModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </section>
  );
}
