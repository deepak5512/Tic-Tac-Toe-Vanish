"use client";

import Link from "next/link";
import React from "react";
import { Home } from "lucide-react";
import Image from "next/image";

const APP_VERSION = "1.0.0";
const DEVELOPER_NAME = "Deepak Bhatter";
const CONTACT_EMAIL = "deepakbhatter5512@gmail.com";
const WEBSITE_URL = "https://portfolio-lovat-phi-17.vercel.app/";

const AboutScreen = () => {
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
        <div className="flex-col items-center justify-between w-full max-w-2xl flex-grow p-5 pt-8 sm:pt-12">
          {/* Header */}
          <header className="w-full flex justify-between items-center mb-6">
            <Link href="/" passHref>
              <button
                aria-label="Go to home"
                className="bg-[rgba(65,76,102,0.8)] p-2.5 cursor-pointer rounded-md hover:opacity-80 transition-opacity"
              >
                <Home />
              </button>
            </Link>
            <h1 className="text-xl text-white text-center flex-1 font-revalia">
              About Game
            </h1>
            {/* Spacer to balance the home button */}
            <div className="w-[44px] h-[44px]"></div>
          </header>

          {/* Main Content Area */}
          <section className="flex-1 w-full bg-[rgba(45,58,75,0.85)] rounded-lg p-5 flex flex-col items-center mb-5">
            <h2 className="text-2xl sm:text-3xl text-white text-center mb-1 font-revalia">
              Tic-Tac-Toe: Vanish
            </h2>
            <p className="text-sm text-[#E0E0E0] text-center mb-5 font-revalia">
              Version {APP_VERSION}
            </p>

            <div className="h-px bg-[rgba(255,255,255,0.2)] w-[90%] my-5"></div>

            <h3 className="text-lg text-white mb-2.5 text-center font-revalia">
              Game Concept
            </h3>
            <p
              className="text-xs sm:text-sm text-[#F0F0F0] text-center mb-1 leading-relaxed sm:leading-loose"
              style={{ lineHeight: "1.7em" }}
            >
              This is a unique twist on the classic Tic-Tac-Toe! Each player can
              only have a maximum of three marks on the board at any time. When
              a player makes their fourth move, their oldest mark vanishes,
              opening up new strategic possibilities.
            </p>

            <div className="h-px bg-[rgba(255,255,255,0.2)] w-[90%] my-5"></div>

            <h3 className="text-lg text-white mb-2.5 text-center font-revalia">
              Developer
            </h3>
            <p className="text-xs sm:text-sm text-[#F0F0F0] text-center mb-1 leading-relaxed sm:leading-loose">
              Developed with ❤️ by {DEVELOPER_NAME}.
            </p>

            <div className="h-px bg-[rgba(255,255,255,0.2)] w-[90%] my-5"></div>

            <h3 className="text-lg text-white mb-2.5 text-center font-revalia">
              Contact & Support
            </h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-sm text-[#A6B3E0] underline text-center my-1 hover:text-[#c0cfff] transition-colors"
              style={{ lineHeight: "1.7em" }} // Matched with descriptionText
            >
              {CONTACT_EMAIL}
            </a>
            {WEBSITE_URL && (
              <a
                href={WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#A6B3E0] underline text-center my-1 hover:text-[#c0cfff] transition-colors"
                style={{ lineHeight: "1.7em" }}
              >
                {WEBSITE_URL}
              </a>
            )}
          </section>

          {/* Footer Button */}
          <footer className="w-full flex justify-center py-5">
            <Link href="/" passHref className="w-[90%] max-w-md">
              <button
                className="w-full bg-gradient-to-r cursor-pointer from-[#8E9BCD] via-[#A6B3E0] to-[#8E9BCD] text-white text-base py-3.5 px-5 rounded-lg font-revalia
                           hover:opacity-90 active:opacity-80 transition-opacity shadow-md"
              >
                Back to Menu
              </button>
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
};

export default AboutScreen;
