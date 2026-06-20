import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Legend from './components/Legend';
import FilterBar from './components/FilterBar';
import GroupCard from './components/GroupCard';
import Bracket from './components/Bracket';
import Note from './components/Note';
import Footer from './components/Footer';

const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300';
const REFRESH_MS = 5 * 60 * 1000;

function getCurrentPhase() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (month < 6 || (month === 6 && day < 11)) return 'Próximamente';
  if (month === 6 && day <= 27) return 'Fase de grupos';
  if ((month === 6 && day >= 28) || (month === 7 && day <= 3)) return '16vos de final';
  if (month === 7 && day <= 7) return '8vos de final';
  if (month === 7 && day <= 11) return 'Cuartos de final';
  if (month === 7 && (day === 14 || day === 15)) return 'Semifinales';
  if (month === 7 && day === 18) return 'Tercer lugar';
  if (month === 7 && day === 19) return 'Final';
  return 'Completado';
}

const FALLBACK = {
  A: [
    ['México', 2, 2, 0, 0, 3, 0, 3, 6],
    ['Corea del Sur', 2, 1, 0, 1, 2, 2, 0, 3],
    ['Chequia', 2, 0, 1, 1, 2, 3, -1, 1],
    ['Sudáfrica', 2, 0, 1, 1, 1, 3, -2, 1],
  ],
  B: [
    ['Canadá', 2, 1, 1, 0, 7, 1, 6, 4],
    ['Suiza', 2, 1, 1, 0, 5, 2, 3, 4],
    ['Bosnia y Herzegovina', 2, 0, 1, 1, 2, 5, -3, 1],
    ['Catar', 2, 0, 1, 1, 1, 7, -6, 1],
  ],
  C: [
    ['Brasil', 2, 1, 1, 0, 4, 1, 3, 4],
    ['Marruecos', 2, 1, 1, 0, 2, 1, 1, 4],
    ['Escocia', 2, 1, 0, 1, 1, 1, 0, 3],
    ['Haití', 2, 0, 0, 2, 0, 4, -4, 0],
  ],
  D: [
    ['Estados Unidos', 2, 2, 0, 0, 6, 1, 5, 6],
    ['Australia', 2, 1, 0, 1, 2, 2, 0, 3],
    ['Paraguay', 2, 1, 0, 1, 2, 4, -2, 3],
    ['Turquía', 2, 0, 0, 2, 0, 3, -3, 0],
  ],
  E: [
    ['Alemania', 1, 1, 0, 0, 7, 1, 6, 3],
    ['Costa de Marfil', 1, 1, 0, 0, 1, 0, 1, 3],
    ['Ecuador', 1, 0, 0, 1, 0, 1, -1, 0],
    ['Curazao', 1, 0, 0, 1, 1, 7, -6, 0],
  ],
  F: [
    ['Suecia', 1, 1, 0, 0, 5, 1, 4, 3],
    ['Japón', 1, 0, 1, 0, 2, 2, 0, 1],
    ['Países Bajos', 1, 0, 1, 0, 2, 2, 0, 1],
    ['Túnez', 1, 0, 0, 1, 1, 5, -4, 0],
  ],
  G: [
    ['Nueva Zelanda', 1, 0, 1, 0, 2, 2, 0, 1],
    ['Irán', 1, 0, 1, 0, 2, 2, 0, 1],
    ['Bélgica', 1, 0, 1, 0, 1, 1, 0, 1],
    ['Egipto', 1, 0, 1, 0, 1, 1, 0, 1],
  ],
  H: [
    ['Uruguay', 1, 0, 1, 0, 1, 1, 0, 1],
    ['Arabia Saudita', 1, 0, 1, 0, 1, 1, 0, 1],
    ['España', 1, 0, 1, 0, 0, 0, 0, 1],
    ['Cabo Verde', 1, 0, 1, 0, 0, 0, 0, 1],
  ],
  I: [
    ['Noruega', 1, 1, 0, 0, 4, 1, 3, 3],
    ['Francia', 1, 1, 0, 0, 3, 1, 2, 3],
    ['Senegal', 1, 0, 0, 1, 1, 3, -2, 0],
    ['Irak', 1, 0, 0, 1, 1, 2, -3, 0],
  ],
  J: [
    ['Argentina', 1, 1, 0, 0, 3, 0, 3, 3],
    ['Austria', 1, 1, 0, 0, 3, 1, 2, 3],
    ['Jordania', 1, 0, 0, 1, 1, 3, -2, 0],
    ['Argelia', 1, 0, 0, 1, 0, 3, -3, 0],
  ],
  K: [
    ['Colombia', 1, 1, 0, 0, 3, 1, 2, 3],
    ['RD Congo', 1, 0, 1, 0, 1, 1, 0, 1],
    ['Portugal', 1, 0, 1, 0, 1, 1, 0, 1],
    ['Uzbekistán', 1, 0, 0, 1, 1, 3, -2, 0],
  ],
  L: [
    ['Inglaterra', 1, 1, 0, 0, 4, 2, 2, 3],
    ['Ghana', 1, 1, 0, 0, 1, 0, 1, 3],
    ['Panamá', 1, 0, 0, 1, 0, 1, -1, 0],
    ['Croacia', 1, 0, 0, 1, 2, 1, -2, 0],
  ],
};

function emptyTeam(name) {
  return { name, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
}

function computeStandingsFromEvents(events) {
  const groups = {};
  for (const ev of events) {
    const comp = ev.competitions && ev.competitions[0];
    if (!comp) continue;
    const note = comp.altGameNote || '';
    const m = note.match(/Group\s+([A-L])/i);
    if (!m) continue;
    const letter = m[1].toUpperCase();
    const completed = comp.status && comp.status.type && comp.status.type.completed;
    if (!completed) continue;
    const [a, b] = comp.competitors || [];
    if (!a || !b) continue;
    groups[letter] = groups[letter] || {};
    const nameA = a.team.displayName,
      nameB = b.team.displayName;
    groups[letter][nameA] = groups[letter][nameA] || emptyTeam(nameA);
    groups[letter][nameB] = groups[letter][nameB] || emptyTeam(nameB);
    const sa = parseInt(a.score, 10),
      sb = parseInt(b.score, 10);
    if (isNaN(sa) || isNaN(sb)) continue;
    const ta = groups[letter][nameA],
      tb = groups[letter][nameB];
    ta.pj++;
    tb.pj++;
    ta.gf += sa;
    ta.gc += sb;
    tb.gf += sb;
    tb.gc += sa;
    if (sa > sb) {
      ta.pg++;
      tb.pp++;
    } else if (sb > sa) {
      tb.pg++;
      ta.pp++;
    } else {
      ta.pe++;
      tb.pe++;
    }
  }
  const out = {};
  for (const letter of GROUP_LETTERS) {
    const teamsObj = groups[letter];
    if (!teamsObj) {
      out[letter] = [];
      continue;
    }
    const rows = Object.values(teamsObj).map((t) => {
      const dg = t.gf - t.gc;
      const pts = t.pg * 3 + t.pe;
      return [t.name, t.pj, t.pg, t.pe, t.pp, t.gf, t.gc, dg, pts];
    });
    rows.sort((x, y) => y[8] - x[8] || y[7] - x[7] || y[5] - x[5]);
    out[letter] = rows;
  }
  return out;
}

function fillMissingGroups(computed) {
  let any = false;
  for (const l of GROUP_LETTERS) {
    if (computed[l] && computed[l].length) any = true;
  }
  if (!any) return null;
  for (const l of GROUP_LETTERS) {
    if (!computed[l] || !computed[l].length) computed[l] = FALLBACK[l] || [];
  }
  return computed;
}

function fillQualifiedTeams(bracket, standings) {
  const filled = JSON.parse(JSON.stringify(bracket));

  if (!filled.round32) filled.round32 = [];

  const getGroupTeams = (letter) => {
    const group = standings[letter] || [];
    return {
      first: group[0] ? group[0][0] : 'Por definir',
      second: group[1] ? group[1][0] : 'Por definir',
    };
  };

  const matchups = [
    { pos: 0, team1Group: 'A', team1Pos: 1, team2Group: 'B', team2Pos: 2 },
    { pos: 1, team1Group: 'C', team1Pos: 1, team2Group: 'D', team2Pos: 2 },
    { pos: 2, team1Group: 'E', team1Pos: 1, team2Group: 'F', team2Pos: 2 },
    { pos: 3, team1Group: 'G', team1Pos: 1, team2Group: 'H', team2Pos: 2 },
    { pos: 4, team1Group: 'I', team1Pos: 1, team2Group: 'J', team2Pos: 2 },
    { pos: 5, team1Group: 'K', team1Pos: 1, team2Group: 'L', team2Pos: 2 },
    { pos: 6, team1Group: 'B', team1Pos: 2, team2Group: 'A', team2Pos: 1 },
    { pos: 7, team1Group: 'D', team1Pos: 2, team2Group: 'C', team2Pos: 1 },
    { pos: 8, team1Group: 'F', team1Pos: 2, team2Group: 'E', team2Pos: 1 },
    { pos: 9, team1Group: 'H', team1Pos: 2, team2Group: 'G', team2Pos: 1 },
    { pos: 10, team1Group: 'J', team1Pos: 2, team2Group: 'I', team2Pos: 1 },
    { pos: 11, team1Group: 'L', team1Pos: 2, team2Group: 'K', team2Pos: 1 },
    { pos: 12, team1Group: 'A', team1Pos: 2, team2Group: 'B', team2Pos: 1 },
    { pos: 13, team1Group: 'C', team1Pos: 2, team2Group: 'D', team2Pos: 1 },
    { pos: 14, team1Group: 'E', team1Pos: 2, team2Group: 'F', team2Pos: 1 },
    { pos: 15, team1Group: 'G', team1Pos: 2, team2Group: 'H', team2Pos: 1 },
  ];

  for (const matchup of matchups) {
    const team1Groups = getGroupTeams(matchup.team1Group);
    const team2Groups = getGroupTeams(matchup.team2Group);

    const team1 = matchup.team1Pos === 1 ? team1Groups.first : team1Groups.second;
    const team2 = matchup.team2Pos === 1 ? team2Groups.first : team2Groups.second;

    if (!filled.round32[matchup.pos]) {
      filled.round32[matchup.pos] = {};
    }

    if (!filled.round32[matchup.pos].team1 || filled.round32[matchup.pos].team1 === 'Por definir') {
      filled.round32[matchup.pos].team1 = team1;
    }
    if (!filled.round32[matchup.pos].team2 || filled.round32[matchup.pos].team2 === 'Por definir') {
      filled.round32[matchup.pos].team2 = team2;
    }
  }

  return filled;
}

function computeBracketFromEvents(events) {
  const bracket = {
    round32: [],
    round16: [],
    quarterfinals: [],
    semifinals: [],
    final: [],
  };

  const phaseMap = {
    'Round of 32': 'round32',
    '16vos': 'round32',
    'Round of 16': 'round16',
    '8vos': 'round16',
    'Quarterfinals': 'quarterfinals',
    'Cuartos': 'quarterfinals',
    'Semifinals': 'semifinals',
    'Semifinal': 'semifinals',
    'Final': 'final',
  };

  for (const ev of events) {
    const comp = ev.competitions && ev.competitions[0];
    if (!comp) continue;

    const note = comp.altGameNote || '';
    let phaseKey = null;

    for (const [key, value] of Object.entries(phaseMap)) {
      if (note.includes(key)) {
        phaseKey = value;
        break;
      }
    }

    if (!phaseKey) continue;

    const completed = comp.status && comp.status.type && comp.status.type.completed;
    const [a, b] = comp.competitors || [];
    if (!a || !b) continue;

    const sa = parseInt(a.score, 10);
    const sb = parseInt(b.score, 10);

    const match = {
      team1: a.team.displayName,
      team2: b.team.displayName,
      score1: !isNaN(sa) ? sa : undefined,
      score2: !isNaN(sb) ? sb : undefined,
      winner: completed && !isNaN(sa) && !isNaN(sb) ? (sa > sb ? 1 : sb > sa ? 2 : 0) : null,
    };

    bracket[phaseKey].push(match);
  }

  return bracket;
}

export default function App() {
  const [standingsData, setStandingsData] = useState(FALLBACK);
  const [bracketData, setBracketData] = useState({});
  const [isLive, setIsLive] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [phase, setPhase] = useState(getCurrentPhase());
  const initialView = getCurrentPhase() === 'Fase de grupos' ? 'groups' : 'bracket';
  const [viewMode, setViewMode] = useState(initialView);

  useEffect(() => {
    const loadLiveStandings = async () => {
      try {
        const res = await fetch(SCOREBOARD_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('http ' + res.status);
        const json = await res.json();
        const computed = computeStandingsFromEvents(json.events || []);
        const merged = fillMissingGroups(computed);
        if (!merged) throw new Error('sin datos utilizables');
        setStandingsData(merged);
        const now = new Date();
        const stamp = now.toLocaleString('es-MX', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
        setTimestamp(stamp);
        setIsLive(true);
      } catch (err) {
        setIsLive(false);
        setTimestamp('');
      }
      setPhase(getCurrentPhase());
    };

    loadLiveStandings();
    const interval = setInterval(loadLiveStandings, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadBracket = async () => {
      try {
        const res = await fetch(SCOREBOARD_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('http ' + res.status);
        const json = await res.json();
        const computed = computeBracketFromEvents(json.events || []);

        // Llenar equipos clasificados desde grupos
        const qualifiedBracket = fillQualifiedTeams(computed, standingsData);
        setBracketData(qualifiedBracket);
      } catch (err) {
        // Silently fail for bracket data
      }
    };

    loadBracket();
    const interval = setInterval(loadBracket, REFRESH_MS);
    return () => clearInterval(interval);
  }, [standingsData]);

  useEffect(() => {
    // Cambiar automáticamente a vista de eliminatorias cuando termina la fase de grupos
    if (phase !== 'Fase de grupos' && phase !== 'Próximamente') {
      setViewMode('bracket');
    } else if (phase === 'Fase de grupos') {
      setViewMode('groups');
    }
  }, [phase]);

  const visibleGroups = currentFilter === 'all' ? GROUP_LETTERS : [currentFilter];
  const isEliminatory = ['16vos de final', '8vos de final', 'Cuartos de final', 'Semifinales', 'Tercer lugar', 'Final'].includes(phase);

  return (
    <>
      <Header isLive={isLive} viewMode={viewMode} onViewChange={setViewMode} />
      <div className="wrap">
        <Hero timestamp={timestamp} isLive={isLive} phase={phase} />
        {viewMode === 'groups' && (
          <>
            <Legend />
            <FilterBar currentFilter={currentFilter} onFilterChange={setCurrentFilter} />
            <section className="groups">
              {visibleGroups.map((letter) => (
                <GroupCard key={letter} letter={letter} teams={standingsData[letter] || []} />
              ))}
            </section>
          </>
        )}
        {viewMode === 'bracket' && <Bracket bracket={bracketData} />}
        <Footer />
      </div>
    </>
  );
}
