"use client";

import { Home, RotateCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";

const IMAGE_PATH_PREFIX = "/";

type Player = "X" | "O";
type BoardCell = Player | null;

type GameResult = {
  winner: Player | "draw" | null;
  line: number[] | null;
};

interface LineDrawData {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

const PvPGameScreen = () => {

  const [board, setBoard] = useState<BoardCell[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("O");
  const [scores, setScores] = useState({ O: 0, X: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [lineDrawData, setLineDrawData] = useState<LineDrawData | null>(null);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const startNextRound = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsGameOver(false);
    setWinner(null);
    setWinningLine(null);
    setLineDrawData(null);
  }, []);

  useEffect(() => {
    if (isGameOver) {
      const timeout = setTimeout(() => {
        startNextRound();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isGameOver, startNextRound]);

  const checkWinner = (currentBoard: BoardCell[]): GameResult => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a] as Player, line: combo };
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: "draw", line: null };
    }
    return { winner: null, line: null };
  };

  const handleCellPress = (index: number) => {
    if (board[index] !== null || isGameOver) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const { winner: gameResult, line: winningCombo } = checkWinner(newBoard);
    if (gameResult) {
      setIsGameOver(true);
      setWinner(gameResult);
      if (winningCombo) setWinningLine(winningCombo);
      if (gameResult === "O") {
        setScores((prev) => ({ ...prev, O: prev.O + 1 }));
      } else if (gameResult === "X") {
        setScores((prev) => ({ ...prev, X: prev.X + 1 }));
      }
      // Don't switch player if game is over
    } else {
      setCurrentPlayer(currentPlayer === "O" ? "X" : "O");
    }
  };

  const handleResetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsGameOver(false);
    setWinner(null);
    setWinningLine(null);
    setScores({ O: 0, X: 0 });
    setCurrentPlayer("O"); // Player O starts on full reset
    setLineDrawData(null);
  }, []);

  useEffect(() => {
    if (isGameOver && winner && winner !== "draw" && winningLine) {
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
  }, [isGameOver, winner, winningLine]);

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

  const getTurnIndicatorText = () => {
    if (isGameOver) {
      if (winner === "O") return "Player O Wins 🎉";
      if (winner === "X") return "Player X Wins 🏆";
      if (winner === "draw") return "It's a Draw 😐";
      return ""; // Should not happen
    }
    return `Player ${currentPlayer}'s Turn`;
  };

  return (
    <>
      <div className="min-h-screen bg-game-bg bg-cover bg-center flex flex-col items-center font-revalia text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/background.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="blur-xs"
          />
        </div>
        <main className="flex flex-col items-center justify-between w-full max-w-2xl flex-grow p-5 pt-8 sm:pt-12">
          {/* Header */}
          <header className="w-full flex justify-between items-center mb-5">
            <Link href="/" passHref>
              <button
                aria-label="Go to home page"
                className="bg-[rgba(65,76,102,0.8)] p-2.5 rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-150"
              >
                <Home />
              </button>
            </Link>
            <h1 className="text-xl sm:text-2xl">Player vs Player</h1>
            {/* Spacer to balance home button */}
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
              <span className="ml-auto font-bold">{scores.O}</span>
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
              <span className="ml-auto font-bold">{scores.X}</span>
            </div>
          </section>

          {/* Turn Indicator */}
          <h2 className="text-2xl sm:text-3xl mb-6 text-center min-h-[40px] animate-fade-in">
            {getTurnIndicatorText()}
          </h2>

          {/* Board */}
          <section className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-square mb-8">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 h-full w-full">
              {board.map((cell, index) => (
                <button
                  key={index}
                  onClick={() => handleCellPress(index)}
                  disabled={isGameOver || cell !== null}
                  className={`
                    aspect-square rounded-lg flex justify-center items-center 
                    transition-all duration-300 ease-out transform
                    ${cell !== null ? "cursor-not-allowed" : "cursor-pointer"}
                    ${
                      isGameOver &&
                      winner &&
                      winner !== "draw" &&
                      winningLine?.includes(index)
                        ? "bg-[#86DA3E] scale-105 shadow-lg shadow-[#86DA3E]/50"
                        : "bg-[rgba(30,40,60,0.9)] hover:bg-opacity-80 active:scale-95"
                    }
                  `}
                  aria-label={`Cell ${index + 1}${
                    cell ? `, marked ${cell}` : ""
                  }`}
                >
                  {renderCellContent(cell)}
                </button>
              ))}
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
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </section>

          {/* Buttons Container */}
          <footer className="w-full max-w-md flex flex-col items-center space-y-3 sm:space-y-4">
            <button
              onClick={handleResetGame}
              className="relative w-[90%] bg-white text-black text-base sm:text-lg py-3.5 px-5 rounded-lg font-revalia flex items-center justify-center
                         hover:bg-gray-200 active:bg-gray-300 transition-colors duration-150 shadow-md"
            >
              <div className="absolute left-5">
                <RotateCw />
              </div>
              Reset Game
            </button>

            <Link href="/gameRules" passHref className="w-[90%]">
              <button
                className="w-full bg-gradient-to-r from-[#8E9BCD] via-[#A6B3E0] to-[#8E9BCD] text-white text-base sm:text-lg py-3.5 px-5 rounded-lg font-revalia
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

export default PvPGameScreen;
