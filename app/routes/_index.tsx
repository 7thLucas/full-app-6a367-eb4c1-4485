import { useState, useCallback } from "react";
import { useConfigurables } from "~/modules/configurables";

// ─── Types ───────────────────────────────────────────────────────────────────

type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[];

// ─── Win detection ────────────────────────────────────────────────────────────

// 6×6 board — win = 4 in a row (row / col / diagonal)
// indices: row r, col c → r*6+c
const WIN_LINES = [
  // rows (3 windows × 6 rows = 18)
  [0,1,2,3],[1,2,3,4],[2,3,4,5],
  [6,7,8,9],[7,8,9,10],[8,9,10,11],
  [12,13,14,15],[13,14,15,16],[14,15,16,17],
  [18,19,20,21],[19,20,21,22],[20,21,22,23],
  [24,25,26,27],[25,26,27,28],[26,27,28,29],
  [30,31,32,33],[31,32,33,34],[32,33,34,35],
  // cols (3 windows × 6 cols = 18)
  [0,6,12,18],[6,12,18,24],[12,18,24,30],
  [1,7,13,19],[7,13,19,25],[13,19,25,31],
  [2,8,14,20],[8,14,20,26],[14,20,26,32],
  [3,9,15,21],[9,15,21,27],[15,21,27,33],
  [4,10,16,22],[10,16,22,28],[16,22,28,34],
  [5,11,17,23],[11,17,23,29],[17,23,29,35],
  // diagonals TL→BR (3×3 = 9)
  [0,7,14,21],[1,8,15,22],[2,9,16,23],
  [6,13,20,27],[7,14,21,28],[8,15,22,29],
  [12,19,26,33],[13,20,27,34],[14,21,28,35],
  // diagonals TR→BL (3×3 = 9)
  [3,8,13,18],[4,9,14,19],[5,10,15,20],
  [9,14,19,24],[10,15,20,25],[11,16,21,26],
  [15,20,25,30],[16,21,26,31],[17,22,27,32],
] as const;

function checkWinner(board: Board): { winner: Player; line: number[] } | null {
  for (const [a, b, c, d] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d]) {
      return { winner: board[a] as Player, line: [a, b, c, d] };
    }
  }
  return null;
}

function checkDraw(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

// ─── Score tracker ───────────────────────────────────────────────────────────

type Scores = { X: number; O: number; draw: number };

// ─── Cell component ───────────────────────────────────────────────────────────

interface CellProps {
  value: Cell;
  index: number;
  isWinCell: boolean;
  disabled: boolean;
  onClick: (index: number) => void;
  playerXColor: string;
  playerOColor: string;
  winHighlightColor: string;
}

function GameCell({
  value,
  index,
  isWinCell,
  disabled,
  onClick,
  playerXColor,
  playerOColor,
  winHighlightColor,
}: CellProps) {
  const textColor = value === "X" ? playerXColor : value === "O" ? playerOColor : "transparent";

  return (
    <button
      aria-label={`Cell ${index + 1}${value ? `, ${value}` : ""}`}
      disabled={disabled || !!value}
      onClick={() => onClick(index)}
      style={{
        backgroundColor: isWinCell ? winHighlightColor + "33" : undefined,
        borderColor: isWinCell ? winHighlightColor : undefined,
        color: textColor,
      }}
      className={[
        "relative flex items-center justify-center",
        "w-full aspect-square rounded-2xl border-2",
        "text-5xl sm:text-6xl font-bold",
        "transition-all duration-200 select-none",
        !value && !disabled
          ? "cursor-pointer hover:bg-gray-100 active:scale-95"
          : "cursor-default",
        isWinCell ? "border-2 shadow-lg" : "border-[var(--color-border)]",
        "bg-white",
      ].join(" ")}
    >
      {value && (
        <span
          className="animate-in zoom-in-50 duration-200"
          style={{ color: textColor }}
        >
          {value}
        </span>
      )}
    </button>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  current: Player;
  winner: Player | null;
  isDraw: boolean;
  playerXLabel: string;
  playerOLabel: string;
  playerXColor: string;
  playerOColor: string;
}

function StatusBadge({
  current,
  winner,
  isDraw,
  playerXLabel,
  playerOLabel,
  playerXColor,
  playerOColor,
}: StatusBadgeProps) {
  if (isDraw) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-700 font-semibold text-lg">
        <span>It&apos;s a Draw!</span>
      </div>
    );
  }

  if (winner) {
    const label = winner === "X" ? playerXLabel : playerOLabel;
    const color = winner === "X" ? playerXColor : playerOColor;
    return (
      <div
        className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-lg text-white shadow-md"
        style={{ backgroundColor: color }}
      >
        <span>{label} Wins!</span>
        <span className="text-2xl">🎉</span>
      </div>
    );
  }

  const label = current === "X" ? playerXLabel : playerOLabel;
  const color = current === "X" ? playerXColor : playerOColor;
  return (
    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-50 border border-gray-200 font-semibold text-lg">
      <span
        className="inline-block w-4 h-4 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span style={{ color }} className="font-bold">
        {label}
      </span>
      <span className="text-gray-500 font-normal">turn</span>
    </div>
  );
}

// ─── Score board ──────────────────────────────────────────────────────────────

interface ScoreBoardProps {
  scores: Scores;
  playerXLabel: string;
  playerOLabel: string;
  playerXColor: string;
  playerOColor: string;
}

function ScoreBoard({
  scores,
  playerXLabel,
  playerOLabel,
  playerXColor,
  playerOColor,
}: ScoreBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
      <ScorePill label={playerXLabel} score={scores.X} color={playerXColor} />
      <ScorePill label="Draw" score={scores.draw} color="#6b7280" />
      <ScorePill label={playerOLabel} score={scores.O} color={playerOColor} />
    </div>
  );
}

function ScorePill({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2">
      <span className="text-xs text-gray-500 font-medium truncate w-full text-center">
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IndexPage() {
  const { config, loading } = useConfigurables();

  const [board, setBoard] = useState<Board>(Array(36).fill(null));
  const [current, setCurrent] = useState<Player>("X");
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0, draw: 0 });

  const result = checkWinner(board);
  const isDraw = !result && checkDraw(board);
  const winLine = result?.line ?? [];
  const winner = result?.winner ?? null;
  const gameOver = !!winner || isDraw;

  const handleClick = useCallback(
    (idx: number) => {
      if (gameOver || board[idx]) return;
      const next = board.slice() as Board;
      next[idx] = current;
      const newResult = checkWinner(next);
      const newDraw = !newResult && checkDraw(next);
      setBoard(next);
      if (newResult) {
        setScores((s) => ({ ...s, [newResult.winner]: s[newResult.winner] + 1 }));
      } else if (newDraw) {
        setScores((s) => ({ ...s, draw: s.draw + 1 }));
      } else {
        setCurrent((p) => (p === "X" ? "O" : "X"));
      }
    },
    [board, current, gameOver]
  );

  const resetGame = useCallback(() => {
    setBoard(Array(36).fill(null));
    setCurrent("X");
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const playerXColor = config.playerXColor ?? "#2563eb";
  const playerOColor = config.playerOColor ?? "#ef4444";
  const winHighlightColor = config.winHighlightColor ?? "#fbbf24";
  const playerXLabel = config.playerXLabel ?? "Player X";
  const playerOLabel = config.playerOLabel ?? "Player O";
  const gameTitle = config.gameTitle ?? "Tic Tac Toe";
  const gameSubtitle = config.gameSubtitle ?? "";
  const resetButtonLabel = config.resetButtonLabel ?? "New Game";
  const appName = config.appName ?? "Tic Tac Toe";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 py-8"
      style={{ backgroundColor: "var(--color-background, #ffffff)" }}
    >
      {/* Header */}
      <header className="mb-8 text-center">
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-1"
          style={{
            fontFamily: "var(--font-heading, Poppins, sans-serif)",
            color: "var(--color-foreground, #1f2937)",
          }}
        >
          {gameTitle}
        </h1>
        {gameSubtitle && (
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{gameSubtitle}</p>
        )}
        <p className="sr-only">{appName}</p>
      </header>

      {/* Score board */}
      <ScoreBoard
        scores={scores}
        playerXLabel={playerXLabel}
        playerOLabel={playerOLabel}
        playerXColor={playerXColor}
        playerOColor={playerOColor}
      />

      {/* Status */}
      <div className="my-6">
        <StatusBadge
          current={current}
          winner={winner}
          isDraw={isDraw}
          playerXLabel={playerXLabel}
          playerOLabel={playerOLabel}
          playerXColor={playerXColor}
          playerOColor={playerOColor}
        />
      </div>

      {/* Board */}
      <div
        className="grid gap-3 w-full"
        style={{ maxWidth: "min(90vw, 480px)", gridTemplateColumns: "repeat(6, 1fr)" }}
      >
        {board.map((cell, idx) => (
          <GameCell
            key={idx}
            value={cell}
            index={idx}
            isWinCell={winLine.includes(idx)}
            disabled={gameOver}
            onClick={handleClick}
            playerXColor={playerXColor}
            playerOColor={playerOColor}
            winHighlightColor={winHighlightColor}
          />
        ))}
      </div>

      {/* Reset button */}
      <button
        onClick={resetGame}
        className="mt-8 px-8 py-3 rounded-full text-base font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: "var(--color-primary, #2563eb)",
          focusRingColor: "var(--color-ring, #2563eb)",
        }}
      >
        {resetButtonLabel}
      </button>

      {/* Footer */}
      <p className="mt-10 text-xs text-gray-400">
        2-player • same device
      </p>
    </div>
  );
}
