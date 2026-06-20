import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Legend from './components/Legend';
import FilterBar from './components/FilterBar';
import GroupCard from './components/GroupCard';
import Note from './components/Note';
import Footer from './components/Footer';

const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300';
const REFRESH_MS = 5 * 60 * 1000;

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

export default function App() {
  const [standingsData, setStandingsData] = useState(FALLBACK);
  const [isLive, setIsLive] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');

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
    };

    loadLiveStandings();
    const interval = setInterval(loadLiveStandings, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const visibleGroups = currentFilter === 'all' ? GROUP_LETTERS : [currentFilter];

  return (
    <>
      <Header isLive={isLive} />
      <div className="wrap">
        <Hero timestamp={timestamp} isLive={isLive} />
        <Legend />
        <FilterBar currentFilter={currentFilter} onFilterChange={setCurrentFilter} />
        <section className="groups">
          {visibleGroups.map((letter) => (
            <GroupCard key={letter} letter={letter} teams={standingsData[letter] || []} />
          ))}
        </section>
        <Note />
        <Footer />
      </div>
    </>
  );
}
