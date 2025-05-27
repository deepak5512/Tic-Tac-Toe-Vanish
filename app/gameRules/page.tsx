"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const IMAGE_PATH_PREFIX = "/";

const GameRulesScreen = () => {
  const router = useRouter();

  const rules = [
    {
      icon: `${IMAGE_PATH_PREFIX}icon_win.png`,
      title: "WIN",
      description: "Get 3 marks in a row, Player wins. Game ends.",
      boardImage: `${IMAGE_PATH_PREFIX}board_win.png`,
    },
    {
      icon: `${IMAGE_PATH_PREFIX}icon_defeat.png`,
      title: "DEFEAT",
      description: "Opponent gets 3 in a row, Player loses, game ends.",
      boardImage: `${IMAGE_PATH_PREFIX}board_defeat.png`,
    },
    {
      icon: `${IMAGE_PATH_PREFIX}icon_draw.png`,
      title: "DRAW",
      description: "Board full, no 3 in a row, No winner, game ends.",
      boardImage: `${IMAGE_PATH_PREFIX}board_draw.png`,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-cover bg-center flex flex-col items-center font-revalia text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/background.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="blur-xs"
          />
        </div>

        <main className="flex-col items-center justify-between w-full max-w-2xl flex-grow p-5 pt-8 sm:pt-12">
          {" "}
          {/* Header */}
          <header className="w-full flex justify-between items-center">
            {" "}
            {/* Adjusted mb */}
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="bg-[rgba(65,76,102,0.8)] p-2.5 cursor-pointer rounded-md hover:opacity-80 transition-opacity duration-150"
            >
              <ArrowLeft size={24} color="white" />
            </button>
          </header>

          {/* Main Content */}
          <div className="pt-10 sm:pt-16">
            {" "}
            {/* Corresponds to paddingTop on mainTitle */}
            <h1 className="text-3xl sm:text-4xl text-white mb-2.5 text-left font-revalia">
              {" "}
              {/* mainTitle */}
              Game Rules
            </h1>
            <div className="h-[1.5px] bg-[rgba(255,255,255,0.25)] w-[30%] mb-8 sm:mb-12"></div>{" "}
            {/* separator2 */}
            <div className="space-y-5">
              {" "}
              {rules.map((rule, index) => (
                <React.Fragment key={rule.title}>
                  <section className="flex flex-row items-center py-5">
                    {" "}
                    {/* ruleItem, py for marginVertical */}
                    <img
                      src={rule.icon}
                      alt={`${rule.title} icon`}
                      className="w-12 h-12 mr-4 sm:mr-4.5 object-contain"
                    />
                    <div className="flex-1 mr-4 sm:mr-4.5">
                      {" "}
                      {/* ruleTextContainer */}
                      <h2 className="text-xl sm:text-2xl text-white mb-1.5 font-revalia">
                        {" "}
                        {/* ruleTitle */}
                        {rule.title}
                      </h2>
                      <p
                        className="text-xs sm:text-sm text-[rgba(255,255,255,0.9)] leading-snug sm:leading-normal font-revalia"
                        style={{ lineHeight: "1.6em" }}
                      >
                        {" "}
                        {/* ruleDescription */}
                        {rule.description}
                      </p>
                    </div>
                    <img
                      src={rule.boardImage}
                      alt={`${rule.title} board example`}
                      className="w-[75px] h-[75px] object-contain"
                    />
                  </section>
                  {index < rules.length - 1 && (
                    <div className="h-[1.5px] bg-[rgba(177,170,170,0.25)] w-full"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default GameRulesScreen;
