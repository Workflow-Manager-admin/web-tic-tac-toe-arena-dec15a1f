import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * BoardSquare is a single square of the tic tac toe board
 */
// PUBLIC_INTERFACE
function BoardSquare({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? ' highlight' : ''}`}
      onClick={onClick}
      tabIndex="0"
      aria-label={value || "empty square"}
    >
      {value}
    </button>
  );
}

/**
 * Board renders the 3x3 tic tac toe board
 */
// PUBLIC_INTERFACE
function Board({ squares, onSquareClick, winningLine }) {
  function isWinning(idx) {
    return winningLine && winningLine.includes(idx);
  }
  return (
    <div className="ttt-board">
      {squares.map((value, idx) => (
        <BoardSquare
          key={idx}
          value={value}
          onClick={() => onSquareClick(idx)}
          highlight={isWinning(idx)}
        />
      ))}
    </div>
  );
}

const defaultTheme = 'light';

const GAME_MODES = {
  VERSUS_USER: 'User vs User',
  VERSUS_COMPUTER: 'User vs Computer',
};

function calculateWinner(squares) {
  // Returns: [winner, line] | null
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diagonals
  ];
  for (let [a,b,c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return [squares[a], [a,b,c]];
    }
  }
  if (squares.every(Boolean)) return ['draw', null];
  return null;
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState(defaultTheme);
  const [mode, setMode] = useState(GAME_MODES.VERSUS_COMPUTER);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState('');
  const [winnerLine, setWinnerLine] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // Effect: Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Effect: Compute result and winner after move
  useEffect(() => {
    const res = calculateWinner(squares);
    if (res) {
      const [resVal, line] = res;
      setWinnerLine(line);
      if (resVal === 'draw') {
        setStatus('It\'s a draw!');
        setGameOver(true);
      } else {
        setStatus(`Winner: ${resVal}`);
        setGameOver(true);
      }
    } else {
      setStatus(`Turn: ${xIsNext ? 'X' : 'O'}`);
      setWinnerLine(null);
      setGameOver(false);
    }
  }, [squares, xIsNext]);

  // Effect: automatic computer move when in correct mode & not blocked
  useEffect(() => {
    if (
      mode === GAME_MODES.VERSUS_COMPUTER &&
      !gameOver &&
      !xIsNext
    ) {
      // Computer (O) plays after small delay for UX
      const timeout = setTimeout(() => {
        const move = computeAIMove(squares, 'O', 'X');
        if (move !== null) handleSquareClick(move);
      }, 500);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [mode, squares, xIsNext, gameOver]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  function handleModeChange(e) {
    setMode(e.target.value);
    handleNewGame(e.target.value, true); // reset for new mode
  }

  // PUBLIC_INTERFACE
  function handleNewGame(modeOverride, silent) {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setWinnerLine(null);
    setStatus('');
    if (!silent && mode === GAME_MODES.VERSUS_COMPUTER) setMode(GAME_MODES.VERSUS_COMPUTER);
    if (!silent && mode === GAME_MODES.VERSUS_USER) setMode(GAME_MODES.VERSUS_USER);
    if (modeOverride) setMode(modeOverride);
  }

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (squares[idx] || gameOver) return;
    // User is always X in vs Computer, X starts in user vs user.
    let current = [...squares];
    current[idx] = xIsNext ? 'X' : 'O';
    setSquares(current);
    setXIsNext((prev) => !prev);
  }

  function computeAIMove(squares, aiChar, userChar) {
    // 1. Win if possible
    for (let i = 0; i < squares.length; ++i) {
      if (!squares[i]) {
        let test = [...squares]; test[i] = aiChar;
        if (calculateWinner(test)?.[0] === aiChar) return i;
      }
    }
    // 2. Block opponent
    for (let i = 0; i < squares.length; ++i) {
      if (!squares[i]) {
        let test = [...squares]; test[i] = userChar;
        if (calculateWinner(test)?.[0] === userChar) return i;
      }
    }
    // 3. Take center
    if (!squares[4]) return 4;
    // 4. Take a corner
    const corners = [0,2,6,8];
    for (let c of corners) if (!squares[c]) return c;
    // 5. Take a side
    const sides = [1,3,5,7];
    for (let s of sides) if (!squares[s]) return s;
    return null;
  }

  // PUBLIC_INTERFACE
  return (
    <div className="App">
      <header className="ttt-header">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      <main className="ttt-main-container">
        <div className="ttt-controls">
          <label htmlFor="mode-select" className="ttt-mode-label">Game Mode:</label>
          <select
            className="ttt-mode-select"
            value={mode}
            onChange={handleModeChange}
            aria-label="Select game mode"
            id="mode-select"
            tabIndex="0"
          >
            <option value={GAME_MODES.VERSUS_COMPUTER}>User vs Computer</option>
            <option value={GAME_MODES.VERSUS_USER}>User vs User</option>
          </select>
        </div>

        <Board 
          squares={squares}
          onSquareClick={(i) => {
            if (mode === GAME_MODES.VERSUS_COMPUTER && !xIsNext) return; // block user click on AI turn
            handleSquareClick(i);
          }}
          winningLine={winnerLine}
        />

        <div className="ttt-status">
          {status}
        </div>

        <button 
          className="ttt-reset-btn"
          onClick={() => handleNewGame()}
          aria-label="Restart game"
          tabIndex="0"
        >
          Restart
        </button>
      </main>
      <footer className="ttt-footer">
        <span>
          &copy; {new Date().getFullYear()} Modern Minimalist Tic Tac Toe &mdash; React + CSS
        </span>
      </footer>
    </div>
  );
}

export default App;
