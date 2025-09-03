import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Ekipdle',
  description: 'Guess Game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-gray-50">
        <Navbar />
        <main className="p-6 max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
