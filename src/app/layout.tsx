import "./globals.css";
import Navbar from "./components/Navbar";
import { Comic_Neue } from "next/font/google";

// Comic Neue fontunu next/font ile import ediyoruz
const comic = Comic_Neue({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata = {
  title: "Yourdle",
  description: "Guess Game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={comic.className}>
      <body className="bg-gradient-to-br from-purple-200 to-pink-200">
        <Navbar />
        <main className="p-6 max-w-5xl mx-auto font-comic">{children}</main>
      </body>
    </html>
  );
}
