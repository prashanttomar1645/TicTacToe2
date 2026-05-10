const { useState, useEffect } = React;

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function getWinner(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], line: [a,b,c] };
  }
  return null;
}

function cpuMove(board) {
  // Win if possible
  for (const [a,b,c] of WIN_LINES) {
    const vals = [board[a], board[b], board[c]];
    if (vals.filter(v => v === 'O').length === 2 && vals.includes(null))
      return [a,b,c][vals.indexOf(null)];
  }
  // Block player win
  for (const [a,b,c] of WIN_LINES) {
    const vals = [board[a], board[b], board[c]];
    if (vals.filter(v => v === 'X').length === 2 && vals.includes(null))
      return [a,b,c][vals.indexOf(null)];
  }
  if (!board[4]) return 4;
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });
  const [vsCP, setVsCP] = useState(false);
  const [status, setStatus] = useState("Player X's turn");
  const [gameOver, setGameOver] = useState(false);
  const [winLine, setWinLine] = useState([]);

  useEffect(() => {
    const result = getWinner(board);
    const isDraw = !result && board.every(Boolean);
    if (result) {
      setWinLine(result.line);
      setStatus(`Player ${result.winner} wins! 🎉`);
      setScores(s => ({ ...s, [result.winner]: s[result.winner] + 1 }));
      setGameOver(true);
    } else if (isDraw) {
      setStatus("It's a draw! 🤝");
      setScores(s => ({ ...s, Draw: s.Draw + 1 }));
      setGameOver(true);
    } else {
      setStatus(vsCP && !isX ? 'CPU is thinking...' : `Player ${isX ? 'X' : 'O'}'s turn`);
    }
  }, [board]);

  useEffect(() => {
    if (!vsCP || isX || gameOver) return;
    const timer = setTimeout(() => {
      setBoard(prev => {
        if (getWinner(prev) || prev.every(Boolean)) return prev;
        const idx = cpuMove(prev);
        if (idx == null) return prev;
        const next = [...prev];
        next[idx] = 'O';
        return next;
      });
      setIsX(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [isX, vsCP, gameOver]);

  function handleClick(index) {
    if (gameOver || board[index] || (vsCP && !isX)) return;
    const next = [...board];
    next[index] = isX ? 'X' : 'O';
    setBoard(next);
    setIsX(prev => !prev);
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setIsX(true);
    setGameOver(false);
    setWinLine([]);
    setStatus("Player X's turn");
  }

  function switchMode(cpu) {
    setVsCP(cpu);
    setScores({ X: 0, O: 0, Draw: 0 });
    reset();
  }

  return (
    <div className="app">
      <h1 className="title">TIC TAC TOE</h1>

      <div className="mode-toggle">
        <button className={`mode-btn ${!vsCP ? 'active' : ''}`} onClick={() => switchMode(false)}>
          👥 2 Players
        </button>
        <button className={`mode-btn ${vsCP ? 'active' : ''}`} onClick={() => switchMode(true)}>
          🤖 vs CPU
        </button>
      </div>

      <div className="scoreboard">
        <div className="score x-score">
          <span className="score-label">✕ {vsCP ? 'You' : 'Player X'}</span>
          <span className="score-val">{scores.X}</span>
        </div>
        <div className="score draw-score">
          <span className="score-label">Draw</span>
          <span className="score-val">{scores.Draw}</span>
        </div>
        <div className="score o-score">
          <span className="score-label">○ {vsCP ? 'CPU' : 'Player O'}</span>
          <span className="score-val">{scores.O}</span>
        </div>
      </div>

      <div className={`status ${gameOver ? 'game-over' : ''}`}>{status}</div>

      <div className="board">
        {board.map((val, i) => (
          <button
            key={i}
            className={`cell ${val ? 'filled' : ''} ${winLine.includes(i) ? 'winning' : ''} ${val === 'X' ? 'x' : val === 'O' ? 'o' : ''}`}
            onClick={() => handleClick(i)}
            disabled={gameOver || !!val || (vsCP && !isX)}
          >
            {val === 'X' && <span className="symbol x-symbol">✕</span>}
            {val === 'O' && <span className="symbol o-symbol">○</span>}
          </button>
        ))}
      </div>

      <button className="reset-btn" onClick={reset}>↺ New Game</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<TicTacToe />);
