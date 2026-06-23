import { useState, useEffect } from 'react';
import { getCountryFlag } from '../utils/countryFlags';
import { getTeamNameES } from '../utils/teamNames';
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

function extractGoalsAndCards(details, team1Id, team2Id) {
  const goals = [];
  const cards = [];

  const getLastName = (fullName) => {
    if (!fullName) return 'Gol';
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1];
  };

  for (const detail of details || []) {
    if (!detail.type) continue;

    const athlete = detail.athletesInvolved?.[0];
    const teamId = detail.team?.id;
    const lastName = getLastName(athlete?.displayName);

    if (detail.scoringPlay) {
      goals.push({
        minute: detail.clock?.displayValue || '',
        player: lastName,
        teamId: teamId,
      });
    }

    if (detail.yellowCard) {
      cards.push({
        minute: detail.clock?.displayValue || '',
        player: lastName,
        card: 'yellow',
        teamId: teamId,
      });
    }

    if (detail.redCard) {
      cards.push({
        minute: detail.clock?.displayValue || '',
        player: lastName,
        card: 'red',
        teamId: teamId,
      });
    }
  }

  return { goals, cards };
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

    const { goals, cards } = extractGoalsAndCards(comp.details, a.team.id, b.team.id);

    todayMatches.push({
      id: event.id,
      team1: getTeamNameES(a.team.displayName),
      team2: getTeamNameES(b.team.displayName),
      team1Id: a.team.id,
      team2Id: b.team.id,
      score1: hasScore ? sa : undefined,
      score2: hasScore ? sb : undefined,
      minute: minute,
      status: isScheduled ? 'scheduled' : isInProgress ? 'live' : isHalftime ? 'halftime' : 'completed',
      isStreaming: isStreaming,
      startTime: event.date,
      goals,
      cards,
    });
  }

  return todayMatches;
}

export default function LiveMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatchDetails, setSelectedMatchDetails] = useState(null);

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
            <div
              key={match.id}
              className={`live-match-card ${match.status}`}
              onClick={() => setSelectedMatchDetails(match)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`live-badge badge-${match.status}`}>
                {badgeText}
              </div>

              <div className="match-teams">
                <div className="match-team">
                  <span className="team-flag">{flag1}</span>
                  <span className="team-name">{match.team1}</span>
                </div>

                <div className="match-score">
                  {match.status === 'scheduled' ? (
                    <div className="score-display vs-display">
                      <span className="vs-text">VS</span>
                    </div>
                  ) : (
                    <div className="score-display">
                      <span className="goal">{match.score1 !== undefined ? match.score1 : '—'}</span>
                      <span className="separator">-</span>
                      <span className="goal">{match.score2 !== undefined ? match.score2 : '—'}</span>
                    </div>
                  )}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMatch(match);
                  }}
                >
                  Ver en vivo
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedMatchDetails && (
        <div className="match-details-modal-overlay" onClick={() => setSelectedMatchDetails(null)}>
          <div
            className="match-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedMatchDetails(null)}
            >
              ✕
            </button>

            <div className="match-details-header">
              <div className="details-team">
                <span className="team-flag">{getCountryFlag(selectedMatchDetails.team1)}</span>
                <span className="team-name">{selectedMatchDetails.team1}</span>
              </div>

              <div className="details-score">
                {selectedMatchDetails.status === 'scheduled' ? (
                  <span className="vs-text">VS</span>
                ) : (
                  <>
                    <span className="score">{selectedMatchDetails.score1 !== undefined ? selectedMatchDetails.score1 : '—'}</span>
                    <span className="separator">-</span>
                    <span className="score">{selectedMatchDetails.score2 !== undefined ? selectedMatchDetails.score2 : '—'}</span>
                  </>
                )}
              </div>

              <div className="details-team details-team-right">
                <span className="team-name">{selectedMatchDetails.team2}</span>
                <span className="team-flag">{getCountryFlag(selectedMatchDetails.team2)}</span>
              </div>
            </div>

            <div className="match-details-body">
              <div className="details-column">
                <h3>{selectedMatchDetails.team1}</h3>
                {selectedMatchDetails.goals.filter(g => g.teamId === selectedMatchDetails.team1Id).length > 0 && (
                  <div className="details-section">
                    <h4>Goles</h4>
                    {Object.entries(
                      selectedMatchDetails.goals
                        .filter(g => g.teamId === selectedMatchDetails.team1Id)
                        .reduce((acc, goal) => {
                          if (!acc[goal.player]) acc[goal.player] = [];
                          acc[goal.player].push(goal.minute);
                          return acc;
                        }, {})
                    ).map(([player, minutes]) => (
                      <div key={`goal-${player}`} className="detail-item goal-item">
                        <span className="icon">⚽</span>
                        <span className="time">{minutes.join(', ')}</span>
                        <span className="name">{player}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedMatchDetails.cards.filter(c => c.teamId === selectedMatchDetails.team1Id).length > 0 && (
                  <div className="details-section">
                    <h4>Tarjetas</h4>
                    {selectedMatchDetails.cards.filter(c => c.teamId === selectedMatchDetails.team1Id).map((card, idx) => (
                      <div key={`card-${idx}`} className="detail-item card-item">
                        <span className="time">{card.minute}</span>
                        <span className={`icon card-${card.card}`}>{card.card === 'yellow' ? '🟨' : '🟥'}</span>
                        <span className="name">{card.player}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="details-column">
                <h3>{selectedMatchDetails.team2}</h3>
                {selectedMatchDetails.goals.filter(g => g.teamId === selectedMatchDetails.team2Id).length > 0 && (
                  <div className="details-section">
                    <h4>Goles</h4>
                    {Object.entries(
                      selectedMatchDetails.goals
                        .filter(g => g.teamId === selectedMatchDetails.team2Id)
                        .reduce((acc, goal) => {
                          if (!acc[goal.player]) acc[goal.player] = [];
                          acc[goal.player].push(goal.minute);
                          return acc;
                        }, {})
                    ).map(([player, minutes]) => (
                      <div key={`goal-${player}`} className="detail-item goal-item">
                        <span className="icon">⚽</span>
                        <span className="time">{minutes.join(', ')}</span>
                        <span className="name">{player}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedMatchDetails.cards.filter(c => c.teamId === selectedMatchDetails.team2Id).length > 0 && (
                  <div className="details-section">
                    <h4>Tarjetas</h4>
                    {selectedMatchDetails.cards.filter(c => c.teamId === selectedMatchDetails.team2Id).map((card, idx) => (
                      <div key={`card-${idx}`} className="detail-item card-item">
                        <span className="time">{card.minute}</span>
                        <span className={`icon card-${card.card}`}>{card.card === 'yellow' ? '🟨' : '🟥'}</span>
                        <span className="name">{card.player}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <LiveStreamModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </section>
  );
}
