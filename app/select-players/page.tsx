"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Home, User, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const handlePress = (playerType: "solo" | "friend") => {
    if (!mode) {
      console.warn("Mode not specified!");
      return;
    }

    let screen = "";

    if (mode === "classic") {
      screen =
        playerType === "solo" ? "/classic/bot" : "/classic/friend";
    } else if (mode === "dynamic") {
      screen =
        playerType === "solo"
          ? "/vanish/bot"
          : "/vanish/friend";
    } else {
      console.warn("Unknown mode:", mode);
      return;
    }

    router.push(screen);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Blurred Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/background.png"
          alt="Background"
          layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Overlay (slight dark tint for readability) */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xs -z-10" />

      {/* Content */}
      <div className="flex flex-col min-h-screen px-5 py-12 items-center">
        {/* Top Bar */}
        <div className="flex justify-start w-full max-w-md mb-8">
          <button
            onClick={() => router.push("/")}
            className="bg-[rgba(65,76,102,0.8)] p-2 rounded-md cursor-pointer"
          >
            <Home size={24} color="white" />
          </button>
        </div>

        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/logo.png"
              width={170}
              height={170}
              alt="Logo"
              className="rounded-2xl"
            />
          </motion.div>
          <h1
            className="text-[32px] text-[#A9B8E0] text-center"
            style={{ fontFamily: "Revalia" }}
          >
            Tic-Tac-Toe
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-6 mt-10 w-full max-w-md">
          <button
            onClick={() => handlePress("solo")}
            className="cursor-pointer relative flex items-center justify-center bg-white text-[#333] w-full py-4 px-6 rounded-xl shadow-md hover:scale-[1.03] transition-transform duration-200"
          >
            <User className="absolute left-5 text-black" size={24} />
            <span
              className="text-[17px] text-center w-full"
              style={{ fontFamily: "Revalia" }}
            >
              Solo
            </span>
          </button>

          <button
            onClick={() => handlePress("friend")}
            className="cursor-pointer relative flex items-center justify-center bg-white text-[#333] w-full py-4 px-6 rounded-xl shadow-md hover:scale-[1.03] transition-transform duration-200"
          >
            <Users className="absolute left-5 text-black" size={24} />
            <span
              className="text-[17px] text-center w-full"
              style={{ fontFamily: "Revalia" }}
            >
              Play with a friend
            </span>
          </button>
        </div>

        {/* About Button */}
        <div className="mt-auto flex justify-center pt-10 w-full max-w-md">
          <button
            onClick={() => router.push("/about")}
            className="cursor-pointer w-full rounded-xl shadow-md overflow-hidden"
          >
            <div
              className="w-full py-4 text-center text-white"
              style={{
                background:
                  "linear-gradient(to right, #8E9BCD, #A6B3E0, #8E9BCD)",
                fontFamily: "Revalia",
                fontSize: "17px",
              }}
            >
              About
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
