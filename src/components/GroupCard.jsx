function DGCell({ value }) {
  const cls = value > 0 ? 'pos' : value < 0 ? 'neg' : '';
  const sign = value > 0 ? '+' : '';
  return <td className={`dg ${cls}`}>{sign}{value}</td>;
}

function TeamRow({ index, team }) {
  const [name, pj, pg, pe, pp, gf, gc, dg, pts] = team;
  const posClass = index === 0 ? 'pos1' : index === 1 ? 'pos2' : '';

  return (
    <tr className={posClass}>
      <td className="team-cell">
        <span className="pos-n">{index + 1}</span>
        <span className="team-name">{name}</span>
      </td>
      <td>{pj}</td>
      <DGCell value={dg} />
      <td className="pts">{pts}</td>
    </tr>
  );
}

export default function GroupCard({ letter, teams }) {
  const pj = teams[0] ? teams[0][1] : 0;
  const statusLabel =
    pj >= 3 ? 'Grupo completo' : pj === 2 ? 'J2 jugada' : pj === 1 ? 'J1 jugada' : 'Por empezar';

  return (
    <div className="group-card" data-group={letter}>
      <div className="gc-head">
        <span className="name">Grupo {letter}</span>
        <span className="status">{statusLabel}</span>
      </div>
      <table className="standings">
        <thead>
          <tr>
            <th className="team-h">Equipo</th>
            <th>PJ</th>
            <th>DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <TeamRow key={i} index={i} team={team} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
