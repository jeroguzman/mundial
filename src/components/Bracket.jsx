import { useState, useEffect } from 'react';
import { getCountryFlag } from '../utils/countryFlags';
import { getTeamNameES } from '../utils/teamNames';

const BRACKET_STRUCTURE = {
  round32: [
    { id: '1A', team1: 'Por definir', team2: 'Por definir' },
    { id: '2B', team1: 'Por definir', team2: 'Por definir' },
    { id: '1C', team1: 'Por definir', team2: 'Por definir' },
    { id: '2D', team1: 'Por definir', team2: 'Por definir' },
    { id: '1E', team1: 'Por definir', team2: 'Por definir' },
    { id: '2F', team1: 'Por definir', team2: 'Por definir' },
    { id: '1G', team1: 'Por definir', team2: 'Por definir' },
    { id: '2H', team1: 'Por definir', team2: 'Por definir' },
    { id: '1I', team1: 'Por definir', team2: 'Por definir' },
    { id: '2J', team1: 'Por definir', team2: 'Por definir' },
    { id: '1K', team1: 'Por definir', team2: 'Por definir' },
    { id: '2L', team1: 'Por definir', team2: 'Por definir' },
    { id: '2A', team1: 'Por definir', team2: 'Por definir' },
    { id: '1B', team1: 'Por definir', team2: 'Por definir' },
    { id: '2C', team1: 'Por definir', team2: 'Por definir' },
    { id: '1D', team1: 'Por definir', team2: 'Por definir' },
  ],
  round16: Array(8).fill(null).map((_, i) => ({ id: `qf${i}`, team1: 'Por definir', team2: 'Por definir' })),
  quarterfinals: Array(4).fill(null).map((_, i) => ({ id: `sf${i}`, team1: 'Por definir', team2: 'Por definir' })),
  semifinals: Array(2).fill(null).map((_, i) => ({ id: `f${i}`, team1: 'Por definir', team2: 'Por definir' })),
  thirdPlace: [{ id: 'third', team1: 'Por definir', team2: 'Por definir' }],
  final: [{ id: 'final', team1: 'Por definir', team2: 'Por definir' }],
};

const ROUNDS = [
  { id: 'round32', label: '16vos', short: '16vos' },
  { id: 'round16', label: '8vos', short: '8vos' },
  { id: 'quarterfinals', label: '4tos', short: '4tos' },
  { id: 'semifinals', label: 'semi', short: 'semi' },
  { id: 'thirdPlace', label: '3er', short: '3er' },
  { id: 'final', label: 'final', short: 'final' },
];

export default function Bracket({ bracket }) {
  const [mergedBracket, setMergedBracket] = useState(BRACKET_STRUCTURE);
  const [selectedRound, setSelectedRound] = useState('round32');

  useEffect(() => {
    const merged = {
      round32: BRACKET_STRUCTURE.round32.map((match, idx) => ({
        ...match,
        ...(bracket?.round32?.[idx] || {}),
      })),
      round16: BRACKET_STRUCTURE.round16.map((match, idx) => ({
        ...match,
        ...(bracket?.round16?.[idx] || {}),
      })),
      quarterfinals: BRACKET_STRUCTURE.quarterfinals.map((match, idx) => ({
        ...match,
        ...(bracket?.quarterfinals?.[idx] || {}),
      })),
      semifinals: BRACKET_STRUCTURE.semifinals.map((match, idx) => ({
        ...match,
        ...(bracket?.semifinals?.[idx] || {}),
      })),
      thirdPlace: BRACKET_STRUCTURE.thirdPlace.map((match, idx) => ({
        ...match,
        ...(bracket?.thirdPlace?.[idx] || {}),
      })),
      final: BRACKET_STRUCTURE.final.map((match, idx) => ({
        ...match,
        ...(bracket?.final?.[idx] || {}),
      })),
    };
    setMergedBracket(merged);
  }, [bracket]);

  const renderTeamRow = (team, score, isWinner, isPending) => {
    const flag = getCountryFlag(team);
    const teamES = getTeamNameES(team);
    return (
      <div className={`bracket-team-row ${isWinner ? 'winner' : ''} ${isPending ? 'pending' : ''}`}>
        <span className="team-flag">{flag}</span>
        <span className="team-name">{teamES}</span>
        <span className="team-score">{score}</span>
      </div>
    );
  };

  const renderMatch = (match) => {
    if (!match) return null;
    const team1 = match.team1 || 'Por definir';
    const team2 = match.team2 || 'Por definir';
    const score1 = match.score1 !== undefined ? match.score1 : '-';
    const score2 = match.score2 !== undefined ? match.score2 : '-';
    const isPending1 = team1 === 'Por definir';
    const isPending2 = team2 === 'Por definir';

    return (
      <div className="bracket-matchup" key={match.id}>
        {renderTeamRow(team1, score1, match.winner === 1, isPending1)}
        {renderTeamRow(team2, score2, match.winner === 2, isPending2)}
      </div>
    );
  };

  const renderColumn = (title, matches, roundName) => {
    return (
      <div className="bracket-column">
        <div className="column-header">{title}</div>
        <div className="column-matches">
          {matches.map((match, idx) => (
            <div
              key={idx}
              className="match-wrapper"
              data-round={roundName}
              data-index={idx}
            >
              {renderMatch(match)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getRoundData = (roundId) => {
    switch (roundId) {
      case 'round32':
        return mergedBracket.round32;
      case 'round16':
        return mergedBracket.round16;
      case 'quarterfinals':
        return mergedBracket.quarterfinals;
      case 'semifinals':
        return mergedBracket.semifinals;
      case 'thirdPlace':
        return mergedBracket.thirdPlace;
      case 'final':
        return mergedBracket.final;
      default:
        return [];
    }
  };

  const selectedRoundLabel = ROUNDS.find(r => r.id === selectedRound)?.label || '';

  return (
    <section className="bracket-section">
      <h2>Eliminatorias al momento</h2>

      {/* Tabs para móvil */}
      <div className="bracket-tabs-mobile">
        {ROUNDS.map((round) => (
          <button
            key={round.id}
            className={`bracket-tab ${selectedRound === round.id ? 'active' : ''}`}
            onClick={() => setSelectedRound(round.id)}
          >
            {round.short}
          </button>
        ))}
      </div>

      {/* Vista móvil: una ronda a la vez */}
      <div className="bracket-mobile-view">
        {renderColumn(selectedRoundLabel, getRoundData(selectedRound), selectedRound)}
      </div>

      {/* Vista desktop: todas las rondas */}
      <div className="bracket-tree-container">
        {renderColumn('16vos de Final', mergedBracket.round32, 'round32')}
        {renderColumn('8vos de Final', mergedBracket.round16, 'round16')}
        {renderColumn('Cuartos', mergedBracket.quarterfinals, 'quarterfinals')}
        {renderColumn('Semifinales', mergedBracket.semifinals, 'semifinals')}
        {renderColumn('Tercer Lugar', mergedBracket.thirdPlace, 'thirdPlace')}
        {renderColumn('Final', mergedBracket.final, 'final')}
      </div>
    </section>
  );
}
