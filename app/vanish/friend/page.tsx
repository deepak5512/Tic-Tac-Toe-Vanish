"use client";

import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { Home, RotateCw } from "lucide-react";
import Image from "next/image";

const IMAGE_PATH_PREFIX = "/";

type Player = "X" | "O";
type BoardCell = Player | null;

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

const AUTO_RESET_DELAY = 2500;

interface LineDrawData {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

function calculateWinnerInfo(board: BoardCell[]): {
  winner: Player | null;
  line: number[] | null;
} {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

const PvPVanishModeGameScreen = () => {
  const [board, setBoard] = useState<BoardCell[]>(Array(9).fill(null));
  const [playerOMoves, setPlayerOMoves] = useState<number[]>([]);
  const [playerXMoves, setPlayerXMoves] = useState<number[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("O");

  const [gameScores, setGameScores] = useState({ O: 0, X: 0 });
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [lineDrawData, setLineDrawData] = useState<LineDrawData | null>(null);

  const resetGame = useCallback((isHardReset: boolean = false) => {
    setBoard(Array(9).fill(null));
    setPlayerOMoves([]);
    setPlayerXMoves([]);
    // setCurrentPlayer("O"); // Keep current player or reset to 'O' for new round
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setLineDrawData(null);
    if (isHardReset) {
      setGameScores({ O: 0, X: 0 });
      setCurrentPlayer("O"); // On hard reset, Player O always starts
    }
  }, []);

  useEffect(() => {
    if (winner || isDraw) return;

    const { winner: currentWinner, line: currentWinningLine } =
      calculateWinnerInfo(board);
    // Draw condition for Vanish Mode PvP: if all cells are full for a moment AND no winner.
    // More complex draw (repetition) is not handled here.
    const currentIsDraw =
      !currentWinner &&
      board.every((cell) => cell !== null) &&
      playerOMoves.length === 3 &&
      playerXMoves.length === 3;

    if (currentWinner) {
      setWinner(currentWinner);
      setWinningLine(currentWinningLine);
      setGameScores((prevScores) => ({
        ...prevScores,
        O: currentWinner === "O" ? prevScores.O + 1 : prevScores.O,
        X: currentWinner === "X" ? prevScores.X + 1 : prevScores.X,
      }));
    } else if (currentIsDraw) {
      setIsDraw(true);
    }
  }, [board, winner, isDraw, playerOMoves.length, playerXMoves.length]);

  useEffect(() => {
    if (winner && winningLine) {
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

  const makeMove = useCallback(
    (index: number, playerMakingMove: Player) => {
      if (winner || isDraw || board[index]) return;

      const newBoard = [...board];
      newBoard[index] = playerMakingMove;
      let newPlayerMoves: number[];
      let setPlayerMoves: React.Dispatch<React.SetStateAction<number[]>>;

      if (playerMakingMove === "O") {
        newPlayerMoves = [...playerOMoves, index];
        setPlayerMoves = setPlayerOMoves;
      } else {
        // Player "X"
        newPlayerMoves = [...playerXMoves, index];
        setPlayerMoves = setPlayerXMoves;
      }

      if (newPlayerMoves.length > 3) {
        const oldestMove = newPlayerMoves.shift();
        if (oldestMove !== undefined) newBoard[oldestMove] = null;
      }
      setPlayerMoves(newPlayerMoves);
      setBoard(newBoard);

      // Winner check is in useEffect, switch turn if game not over
      // Check for immediate winner after move before switching turn
      const { winner: gameWinner } = calculateWinnerInfo(newBoard);
      if (!gameWinner && !newBoard.every((cell) => cell !== null)) {
        setCurrentPlayer(playerMakingMove === "O" ? "X" : "O");
      }
    },
    [board, winner, isDraw, playerOMoves, playerXMoves]
  );

  const handleCellPress = (index: number) => {
    // No need to check isHumanTurn, it's always a human's turn in PvP
    if (!winner && !isDraw && !board[index]) {
      makeMove(index, currentPlayer);
    }
  };

  const handleHardResetGame = () => {
    resetGame(true);
  };

  const renderCellContent = (cellValue: BoardCell) => {
    if (cellValue === "X")
      return (
        <Image
          width={25}
          height={25}
          src={`${IMAGE_PATH_PREFIX}cross.png`}
          alt="X"
          className="w-3/5 h-3/5 object-contain animate-scale-in"
        />
      );
    if (cellValue === "O")
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
    (currentPlayer === "O" && playerOMoves.length >= 3
      ? playerOMoves[0]
      : currentPlayer === "X" && playerXMoves.length >= 3
      ? playerXMoves[0]
      : null);

  let gameStatusText: string;
  if (winner) {
    gameStatusText = `Player ${winner} Wins 🎉!`;
  } else if (isDraw) {
    gameStatusText = "It's a Draw 😐";
  } else {
    gameStatusText = `Player ${currentPlayer}'s Turn`;
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
                className="bg-[rgba(65,76,102,0.8)] cursor-pointer p-2.5 rounded-md hover:opacity-80 transition-opacity duration-150"
              >
                <Home />
              </button>
            </Link>
            <h1 className="text-lg sm:text-xl text-center">
              Player vs Player <br /> Vanish Mode
            </h1>
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
              <span>Player O: </span>
              <span className="ml-auto font-bold">{gameScores.O}</span>
            </div>
            <div className="bg-[rgba(45,58,75,0.85)] p-3 rounded-lg w-[48%] flex items-center">
              <Image
                width={20}
                height={20}
                src={`${IMAGE_PATH_PREFIX}cross.png`}
                alt="Player X icon"
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
              />
              <span>Player X: </span>
              <span className="ml-auto font-bold">{gameScores.X}</span>
            </div>
          </section>

          {/* Turn Indicator */}
          <h2 className="text-xl sm:text-2xl mb-6 text-center min-h-[30px] sm:min-h-[36px] animate-fade-in">
            {gameStatusText}
          </h2>

          {/* Board */}
          <section className="relative w-full max-w-[300px] sm:max-w-[330px] aspect-square mb-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 h-full w-full">
              {board.map((cell, index) => {
                const isVanishing = vanishingCellIndex === index;
                const isWinning = winningLine?.includes(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleCellPress(index)}
                    disabled={!!winner || isDraw || !!board[index]}
                    className={`
                      aspect-square rounded-lg flex justify-center items-center 
                      transition-all duration-200 ease-out transform
                      ${
                        !!winner || isDraw || (!!board[index] && !isVanishing)
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
              className="relative w-[90%] bg-white text-black text-base sm:text-lg py-3.5 px-5 rounded-lg font-revalia flex items-center justify-center
                         hover:bg-gray-200 active:bg-gray-300 cursor-pointer transition-colors duration-150 shadow-md"
            >
              <div className="absolute left-5">
                <RotateCw />
              </div>
              Reset Game
            </button>
            <Link href="/gameRules" passHref className="w-[90%]">
              <button
                className="w-full bg-gradient-to-r from-[#8E9BCD] via-[#A6B3E0] to-[#8E9BCD] text-white text-base sm:text-lg py-3.5 px-5 rounded-lg font-revalia
                           hover:opacity-90 active:opacity-80 cursor-pointer transition-opacity duration-150 shadow-md"
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

export default PvPVanishModeGameScreen;
