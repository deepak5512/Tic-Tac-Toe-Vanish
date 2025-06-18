"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { ChevronsUpDown, Home, RotateCw } from "lucide-react";

const IMAGE_PATH_PREFIX = "/";

type Player = "X" | "O" | null;
type Level = "Easy" | "Medium" | "Hard";

const HUMAN_PLAYER: Player = "O";
const BOT_PLAYER: Player = "X";

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const MAX_DEPTH = 5;
const AUTO_RESET_DELAY = 2500;

interface LineDrawData {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

function calculateWinnerInfo(board: Player[]): {
  winner: Player;
  line: number[] | null;
} {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

function boardToKey(board: Player[]): string {
  return board.map((cell) => cell ?? "-").join("");
}

function minimax(
  currentBoard: Player[],
  currentHumanMoves: number[],
  currentBotMoves: number[],
  isMaximizing: boolean,
  depth: number,
  memo: Map<string, number>
): number {
  const key =
    boardToKey(currentBoard) +
    (isMaximizing ? "max" : "min") +
    depth.toString() +
    currentHumanMoves.join(",") +
    currentBotMoves.join(",");
  if (memo.has(key)) return memo.get(key)!;

  const { winner: gameWinner } = calculateWinnerInfo(currentBoard);
  if (gameWinner === BOT_PLAYER) return 10 - depth;
  if (gameWinner === HUMAN_PLAYER) return depth - 10;
  if (
    currentBoard.every((cell) => cell !== null && gameWinner === null) ||
    depth >= MAX_DEPTH
  ) {
    // Check for draw if all cells filled and no winner
    if (currentBoard.every((cell) => cell !== null)) return 0; // Draw if full, no winner
  }
  if (depth >= MAX_DEPTH) return 0; // Max depth reached

  let bestScore = isMaximizing ? -Infinity : Infinity;
  let foundMove = false;

  for (let i = 0; i < currentBoard.length; i++) {
    if (currentBoard[i] === null) {
      foundMove = true;
      const newBoard = [...currentBoard];
      let score;

      if (isMaximizing) {
        // Bot's turn (X)
        newBoard[i] = BOT_PLAYER;
        const newBotMoves = [...currentBotMoves, i];
        if (newBotMoves.length > 3) {
          newBoard[newBotMoves[0]] = null;
          newBotMoves.shift();
        }
        score = minimax(
          newBoard,
          [...currentHumanMoves],
          newBotMoves,
          false,
          depth + 1,
          memo
        );
        bestScore = Math.max(score, bestScore);
      } else {
        // Human's turn (O)
        newBoard[i] = HUMAN_PLAYER;
        const newHumanMoves = [...currentHumanMoves, i];
        if (newHumanMoves.length > 3) {
          newBoard[newHumanMoves[0]] = null;
          newHumanMoves.shift();
        }
        score = minimax(
          newBoard,
          newHumanMoves,
          [...currentBotMoves],
          true,
          depth + 1,
          memo
        );
        bestScore = Math.min(score, bestScore);
      }
    }
  }

  if (!foundMove) return 0;

  memo.set(key, bestScore);
  return bestScore;
}

function findBestMove(
  currentBoard: Player[],
  humanMoves: number[],
  botMoves: number[]
): number {
  let bestScore = -Infinity;
  let move = -1;
  const memo = new Map<string, number>();

  const availableMoves = currentBoard
    .map((cell, idx) => (cell === null ? idx : -1))
    .filter((idx) => idx !== -1);
  if (availableMoves.length === 0) return -1; // No moves left

  for (const i of availableMoves) {
    const newBoard = [...currentBoard];
    newBoard[i] = BOT_PLAYER; // Bot makes a move
    const newBotMoves = [...botMoves, i];
    if (newBotMoves.length > 3) {
      // Vanish logic
      newBoard[newBotMoves[0]] = null;
      newBotMoves.shift(); // This shift is for the *next* state, not current
    }
    // Create a temporary bot moves array for the minimax call, reflecting the state *after* this move
    const tempBotMovesForMinimax = [...botMoves, i];
    if (tempBotMovesForMinimax.length > 3) tempBotMovesForMinimax.shift();

    const score = minimax(
      newBoard,
      [...humanMoves],
      tempBotMovesForMinimax,
      false,
      1,
      memo
    ); // depth starts at 1, next is human (not maximizing)

    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move === -1 ? getRandomMove(currentBoard) : move; // Fallback to random if no best move found
}

function getRandomMove(board: Player[]): number {
  const emptyCells = board
    .map((v, i) => (v === null ? i : -1))
    .filter((v) => v !== -1);
  if (emptyCells.length === 0) return -1;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

const VanishModeGameScreen = () => {

  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [humanMoves, setHumanMoves] = useState<number[]>([]);
  const [botMoves, setBotMoves] = useState<number[]>([]);
  const [isHumanTurn, setIsHumanTurn] = useState(true);

  const levels: Level[] = ["Easy", "Medium", "Hard"];
  const [currentLevel, setCurrentLevel] = useState<Level>(levels[0]);

  const [gameScores, setGameScores] = useState({ you: 0, bot: 0 });
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [lineDrawData, setLineDrawData] = useState<LineDrawData | null>(null);

  const resetGame = useCallback((isHardReset: boolean = false) => {
    setBoard(Array(9).fill(null));
    setHumanMoves([]);
    setBotMoves([]);
    setIsHumanTurn(true);
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setLineDrawData(null);
    if (isHardReset) {
      setGameScores({ you: 0, bot: 0 });
    }
  }, []);

  useEffect(() => {
    if (winner || isDraw) return;

    const { winner: currentWinner, line: currentWinningLine } =
      calculateWinnerInfo(board);
    const currentIsDraw =
      !currentWinner &&
      humanMoves.length === 3 &&
      botMoves.length === 3 &&
      board.every((cell) => cell !== null);

    if (currentWinner) {
      setWinner(currentWinner);
      setWinningLine(currentWinningLine);
      setGameScores((prevScores) => ({
        ...prevScores,
        you:
          currentWinner === HUMAN_PLAYER ? prevScores.you + 1 : prevScores.you,
        bot: currentWinner === BOT_PLAYER ? prevScores.bot + 1 : prevScores.bot,
      }));
    } else if (currentIsDraw) {
      setIsDraw(true);
    }
  }, [board, winner, isDraw, humanMoves.length, botMoves.length]);

  const makeMove = useCallback(
    (index: number, player: Player) => {
      if (winner || isDraw || board[index]) return;

      const newBoard = [...board];
      newBoard[index] = player;
      let newPlayerMoves: number[];

      if (player === HUMAN_PLAYER) {
        newPlayerMoves = [...humanMoves, index];
        if (newPlayerMoves.length > 3) {
          const oldestMove = newPlayerMoves.shift(); // Get and remove oldest
          if (oldestMove !== undefined) newBoard[oldestMove] = null; // Vanish from board
        }
        setHumanMoves(newPlayerMoves);
      } else {
        // BOT_PLAYER
        newPlayerMoves = [...botMoves, index];
        if (newPlayerMoves.length > 3) {
          const oldestMove = newPlayerMoves.shift();
          if (oldestMove !== undefined) newBoard[oldestMove] = null;
        }
        setBotMoves(newPlayerMoves);
      }

      setBoard(newBoard);
      // Winner check is now in a separate useEffect, so just switch turn
      setIsHumanTurn(player === BOT_PLAYER);
    },
    [board, winner, isDraw, humanMoves, botMoves] // Removed resetGame, calculateWinnerInfo, setGameScores from deps
  );

  useEffect(() => {
    if (!isHumanTurn && !winner && !isDraw) {
      const timer = setTimeout(() => {
        let move: number;
        if (currentLevel === "Easy") {
          move = getRandomMove(board);
        } else if (currentLevel === "Medium") {
          move =
            Math.random() < 0.6 // More chances for random in medium
              ? getRandomMove(board)
              : findBestMove(board, humanMoves, botMoves);
        } else {
          // Hard
          move = findBestMove(board, humanMoves, botMoves);
        }

        if (move !== -1) {
          makeMove(move, BOT_PLAYER);
        } else {
          if (board.every((cell) => cell !== null)) setIsDraw(true);
        }
      }, 700); // Slightly longer delay for bot
      return () => clearTimeout(timer);
    }
  }, [
    isHumanTurn,
    winner,
    isDraw,
    board,
    currentLevel,
    humanMoves,
    botMoves,
    resetGame,
    makeMove,
  ]); // Added resetGame

  useEffect(() => {
    // For drawing the winning line
    if (winner && winner !== null && winningLine) {
      // Ensure winner is not null
      const getLineCoords = (): LineDrawData | null => {
        const pos = ["16.67%", "50%", "83.33%"];
        const edgeOffset = "5%";
        const farEdgeOffset = "95%";
        if (winningLine.every((cellIdx) => [0, 1, 2].includes(cellIdx)))
          return { x1: edgeOffset, y1: pos[0], x2: farEdgeOffset, y2: pos[0] };
        if (winningLine.every((cellIdx) => [3, 4, 5].includes(cellIdx)))
          return { x1: edgeOffset, y1: pos[1], x2: farEdgeOffset, y2: pos[1] };
        if (winningLine.every((cellIdx) => [6, 7, 8].includes(cellIdx)))
          return { x1: edgeOffset, y1: pos[2], x2: farEdgeOffset, y2: pos[2] };
        if (winningLine.every((cellIdx) => [0, 3, 6].includes(cellIdx)))
          return { x1: pos[0], y1: edgeOffset, x2: pos[0], y2: farEdgeOffset };
        if (winningLine.every((cellIdx) => [1, 4, 7].includes(cellIdx)))
          return { x1: pos[1], y1: edgeOffset, x2: pos[1], y2: farEdgeOffset };
        if (winningLine.every((cellIdx) => [2, 5, 8].includes(cellIdx)))
          return { x1: pos[2], y1: edgeOffset, x2: pos[2], y2: farEdgeOffset };
        if (winningLine.every((cellIdx) => [0, 4, 8].includes(cellIdx)))
          return {
            x1: edgeOffset,
            y1: edgeOffset,
            x2: farEdgeOffset,
            y2: farEdgeOffset,
          };
        if (winningLine.every((cellIdx) => [2, 4, 6].includes(cellIdx)))
          return {
            x1: farEdgeOffset,
            y1: edgeOffset,
            x2: edgeOffset,
            y2: farEdgeOffset,
          };
        return null;
      };
      setLineDrawData(getLineCoords());
    } else {
      setLineDrawData(null);
    }
  }, [winner, winningLine]);

  useEffect(() => {
    if (winner || isDraw) {
      const roundEndTimer = setTimeout(() => {
        resetGame(false); // Soft reset for next round
      }, AUTO_RESET_DELAY);
      return () => clearTimeout(roundEndTimer);
    }
  }, [winner, isDraw, resetGame]);

  const handleCellPress = (index: number) => {
    if (isHumanTurn && !winner && !isDraw && !board[index]) {
      makeMove(index, HUMAN_PLAYER);
    }
  };

  const handleHardResetGame = () => {
    resetGame(true);
  };

  const handleChangeLevel = () => {
    const currentIndex = levels.indexOf(currentLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    setCurrentLevel(levels[nextIndex]);
    resetGame(true); // Hard reset when level changes
  };

  const renderCellContent = (cellValue: Player) => {
    if (cellValue === BOT_PLAYER)
      return (
        <Image
        width={25}
        height={25}
          src={`${IMAGE_PATH_PREFIX}cross.png`}
          alt="X"
          className="w-3/5 h-3/5 object-contain animate-scale-in"
        />
      );
    if (cellValue === HUMAN_PLAYER)
      return (
        <Image
        width={25}
        height={25}
          src={`${IMAGE_PATH_PREFIX}circle.png`}
          alt="O"
          className="w-3/5 h-3/5 object-contain animate-scale-in"
        />
      );
    return null;
  };

  const vanishingCellIndex =
    !winner &&
    !isDraw &&
    (isHumanTurn && humanMoves.length >= 3
      ? humanMoves[0]
      : !isHumanTurn && botMoves.length >= 3
      ? botMoves[0]
      : null);

  let gameStatusText: string;
  if (winner) {
    gameStatusText = `${winner === HUMAN_PLAYER ? "You Win" : "Bot Wins"} 🎉!`;
  } else if (isDraw) {
    gameStatusText = "It's a Draw 😐";
  } else {
    gameStatusText = `${isHumanTurn ? "Your" : "Bot's"} Turn (${
      isHumanTurn ? "O" : "X"
    })`;
  }

  return (
    <>
      <div className="min-h-screen bg-game-bg bg-cover bg-center flex flex-col items-center overflow-hidden font-revalia text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/background.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <main className="flex flex-col items-center justify-between w-full max-w-2xl flex-grow p-5 pt-8 sm:pt-12">
          {/* Header */}
          <header className="w-full flex justify-between items-center mb-5">
            <Link href="/" passHref>
              <button
                aria-label="Go to home page"
                className="bg-[rgba(65,76,102,0.8)] p-2.5 cursor-pointer rounded-md hover:opacity-80 transition-opacity duration-150"
              >
                <Home />
              </button>
            </Link>
            <button
              onClick={handleChangeLevel}
              className="px-3 flex py-2 text-lg hover:opacity-80 transition-opacity duration-150"
            >
              {`${currentLevel} Mode`} <ChevronsUpDown />
            </button>
            <div className="w-[44px] sm:w-[46px]"></div>
          </header>

          {/* Score Container */}
          <section className="w-full flex justify-between items-center mb-6 text-sm sm:text-base">
            <div className="bg-[rgba(45,58,75,0.85)] p-3 rounded-lg w-[48%] flex items-center">
              <Image
              width={25}
              height={25}
                src={`${IMAGE_PATH_PREFIX}circle.png`}
                alt="Player O icon"
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2"
              />
              <span>You (O): </span>
              <span className="ml-auto font-bold">{gameScores.you}</span>
            </div>
            <div className="bg-[rgba(45,58,75,0.85)] p-3 rounded-lg w-[48%] flex items-center">
              <Image
              width={20}
              height={20}
                src={`${IMAGE_PATH_PREFIX}cross.png`}
                alt="Player X icon"
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
              />
              <span>Bot (X): </span>
              <span className="ml-auto font-bold">{gameScores.bot}</span>
            </div>
          </section>

          {/* Turn Indicator */}
          <h2 className="text-xl sm:text-2xl mb-6 text-center min-h-[30px] sm:min-h-[36px] animate-fade-in">
            {gameStatusText}
          </h2>

          {/* Board */}
          <section className="relative w-full max-w-[300px] sm:max-w-[330px] aspect-square mb-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 h-full w-full">
              {" "}
              {/* Adjusted gap */}
              {board.map((cell, index) => {
                const isVanishing = vanishingCellIndex === index;
                const isWinning = winningLine?.includes(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleCellPress(index)}
                    disabled={
                      !isHumanTurn || !!winner || isDraw || !!board[index]
                    }
                    className={`
                      aspect-square rounded-lg flex justify-center items-center 
                      transition-all duration-200 ease-out transform
                      ${
                        !isHumanTurn ||
                        !!winner ||
                        isDraw ||
                        (!!board[index] && !isVanishing)
                          ? "cursor-not-allowed opacity-70"
                          : "cursor-pointer"
                      }
                      ${
                        isWinning
                          ? "bg-[rgba(0,180,0,0.7)] scale-105 shadow-lg shadow-green-400/50"
                          : ""
                      }
                      ${
                        !isWinning && isVanishing
                          ? "bg-[rgba(15,20,30,0.9)] animate-pulse-slight"
                          : ""
                      }
                      ${
                        !isWinning && !isVanishing
                          ? "bg-[rgba(30,40,60,0.9)] hover:bg-[rgba(30,40,60,0.7)] active:scale-95"
                          : ""
                      }
                    `}
                    aria-label={`Cell ${index + 1}${
                      cell ? `, marked ${cell}` : ""
                    }${isVanishing ? ", will vanish next" : ""}`}
                  >
                    {renderCellContent(cell)}
                  </button>
                );
              })}
            </div>

            {/* SVG Overlay for Winning Line */}
            {lineDrawData && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <line
                  x1={lineDrawData.x1}
                  y1={lineDrawData.y1}
                  x2={lineDrawData.x2}
                  y2={lineDrawData.y2}
                  className="stroke-[#99a2c3] animate-draw-line"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </section>

          {/* Buttons Container */}
          <footer className="w-full max-w-md flex flex-col items-center space-y-3 sm:space-y-4">
            <button
              onClick={handleHardResetGame}
              className="relative cursor-pointer w-[90%] bg-white text-black text-base sm:text-lg py-3.5 px-5 rounded-lg font-revalia flex items-center justify-center
                         hover:bg-gray-200 active:bg-gray-300 transition-colors duration-150 shadow-md"
            >
              <div className="absolute left-5">
                <RotateCw />
              </div>
              Reset Game
            </button>

            <Link href="/gameRules" passHref className="w-[90%]">
              <button
                className="w-full cursor-pointer bg-gradient-to-r from-[#8E9BCD] via-[#A6B3E0] to-[#8E9BCD] text-white text-base sm:text-lg py-3.5 px-5 rounded-lg font-revalia
                           hover:opacity-90 active:opacity-80 transition-opacity duration-150 shadow-md"
              >
                Game Rules
              </button>
            </Link>
          </footer>
        </main>
      </div>
    </>
  );
};

export default VanishModeGameScreen;
