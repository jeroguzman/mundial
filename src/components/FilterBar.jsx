const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function FilterBar({ currentFilter, onFilterChange }) {
  return (
    <div className="filter-bar">
      <button
        className={`chip ${currentFilter === 'all' ? 'active' : ''}`}
        onClick={() => onFilterChange('all')}
      >
        Todos
      </button>
      {GROUP_LETTERS.map((letter) => (
        <button
          key={letter}
          className={`chip ${currentFilter === letter ? 'active' : ''}`}
          onClick={() => onFilterChange(letter)}
        >
          Grupo {letter}
        </button>
      ))}
    </div>
  );
}
