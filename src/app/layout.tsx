import "./globals.css";
import Navbar from "./components/Common/Navbar";
import { Comic_Neue } from "next/font/google";
import Footer from "./components/Footer/page";

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
      <body className="flex flex-col min-h-screen bg-gradient-to-br from-purple-200 to-pink-200">
        <Navbar />
        {/* main flex-grow ile alanı dolduracak */}
        <main className="flex-grow p-6 w-full font-comic">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
