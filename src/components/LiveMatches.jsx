import { useState, useEffect } from 'react';
import { getCountryFlag } from '../utils/countryFlags';
import LiveStreamModal from './LiveStreamModal';

const SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300';

function getLocalTime(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isToday(isoDate) {
  if (!isoDate) return false;
  const date = new Date(isoDate);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function extractLiveMatches(events) {
  const todayMatches = [];

  for (const event of events || []) {
    // Solo mostrar partidos de hoy
    if (!isToday(event.date)) continue;

    const comp = event.competitions && event.competitions[0];
    if (!comp) continue;

    const status = comp.status && comp.status.type;
    if (!status) continue;

    const [a, b] = comp.competitors || [];
    if (!a || !b) continue;

    // Determinar estado del partido
    const isScheduled = status.name === 'STATUS_SCHEDULED' || status.name === 'STATUS_DELAYED';
    const isInProgress = status.name && (
      status.name.includes('FIRST_HALF') ||
      status.name.includes('SECOND_HALF') ||
      status.name.toLowerCase().includes('in progress')
    );
    const isHalftime = status.name && (
      status.name.includes('HALFTIME') ||
      status.name.includes('HALF_TIME') ||
      status.name.includes('halftime') ||
      status.name.toLowerCase().includes('halftime')
    );
    const isCompleted = status.name === 'STATUS_FULL_TIME';

    const sa = parseInt(a.score, 10);
    const sb = parseInt(b.score, 10);
    const hasScore = !isNaN(sa) && !isNaN(sb);

    if (!isScheduled && !isInProgress && !isHalftime && !isCompleted) continue;

    // Extraer información de tiempo
    let minute = '';
    let isStreaming = false;

    if (isScheduled) {
      minute = status.name === 'STATUS_DELAYED' ? 'Retrasado' : getLocalTime(event.date);
    } else if (isInProgress) {
      minute = status.detail || 'En vivo';
      isStreaming = true;
    } else if (isHalftime) {
      minute = status.detail === 'HT' || status.detail === 'ht' ? 'Medio Tiempo' : (status.detail || 'Medio Tiempo');
    } else if (isCompleted) {
      minute = 'Finalizado';
    }

    todayMatches.push({
      id: event.id,
      team1: a.team.displayName,
      team2: b.team.displayName,
      score1: hasScore ? sa : undefined,
      score2: hasScore ? sb : undefined,
      minute: minute,
      status: isScheduled ? 'scheduled' : isInProgress ? 'live' : isHalftime ? 'halftime' : 'completed',
      isStreaming: isStreaming,
      startTime: event.date,
    });
  }

  return todayMatches;
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
        const matches = extractLiveMatches(json.events || []);
        setMatches(matches);

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
          const badgeText = match.status === 'live' ? 'EN VIVO' : match.status === 'halftime' ? 'DESCANSO' : match.status === 'completed' ? 'FINALIZADO' : 'PRÓXIMO';

          return (
            <div key={match.id} className={`live-match-card ${match.status}`}>
              <div className={`live-badge badge-${match.status}`}>
                {badgeText}
              </div>

              <div className="match-teams">
                <div className="match-team">
                  <span className="team-flag">{flag1}</span>
                  <span className="team-name">{match.team1}</span>
                </div>

                <div className="match-score">
                  <div className="score-display">
                    <span className="goal">{match.score1 !== undefined ? match.score1 : '—'}</span>
                    <span className="separator">-</span>
                    <span className="goal">{match.score2 !== undefined ? match.score2 : '—'}</span>
                  </div>
                  <div className="match-minute">{match.minute}</div>
                </div>

                <div className="match-team">
                  <span className="team-name">{match.team2}</span>
                  <span className="team-flag">{flag2}</span>
                </div>
              </div>

              {match.isStreaming && (
                <button
                  className="watch-live-btn"
                  onClick={() => setSelectedMatch(match)}
                >
                  Ver en vivo
                </button>
              )}
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
