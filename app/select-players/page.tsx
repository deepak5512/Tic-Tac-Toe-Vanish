import { Suspense } from "react";
import SelectPageClient from "./SelectPageClient";
import Image from "next/image";

export default function SelectPlayersPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-cover bg-center">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/background.png"
              alt="Background"
              layout="fill"
              objectFit="cover"
              // className="blur-xs"
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/logo.png"
              width={170}
              height={170}
              alt="Logo"
              className="rounded-2xl"
            />
            <h1
              className="text-[32px] text-[#A9B8E0] text-center"
              style={{ fontFamily: "Revalia" }}
            >
              Loading...
            </h1>
          </div>
        </div>
      }
    >
      <SelectPageClient />
    </Suspense>
  );
}
