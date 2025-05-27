import "./globals.css";
import { Revalia } from "next/font/google";

const revalia = Revalia({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "Tic Tac Toe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={revalia.className}>{children}</body>
    </html>
  );
}
