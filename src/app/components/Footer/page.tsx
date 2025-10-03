"use client";

import Link from "next/link";
import { FaInstagram, FaTwitter, FaGithub, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#13173A] border-t border-yellow-400 mt-8">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Telif hakkı */}
        <p className="text-yellow-300 font-comic text-sm md:text-base text-center md:text-left">
          © {new Date().getFullYear()} Yourdle. Tüm hakları saklıdır.
        </p>

        {/* Menü Linkleri */}
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/about"
            className="text-yellow-300 hover:text-yellow-400 transition-colors font-comic"
          >
            Hakkımızda
          </Link>
          <Link
            href="/contact"
            className="text-yellow-300 hover:text-yellow-400 transition-colors font-comic"
          >
            İletişim
          </Link>
          <Link
            href="/privacy"
            className="text-yellow-300 hover:text-yellow-400 transition-colors font-comic"
          >
            Gizlilik Politikası
          </Link>
        </div>

        {/* Sosyal ikonlar */}
        <div className="flex gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-300 hover:text-yellow-400 transition-colors text-xl"
          >
            <FaInstagram />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-300 hover:text-yellow-400 transition-colors text-xl"
          >
            <FaTwitter />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-300 hover:text-yellow-400 transition-colors text-xl"
          >
            <FaGithub />
          </a>
          <a
            href="mailto:info@yourdle.com"
            className="text-yellow-300 hover:text-yellow-400 transition-colors text-xl"
          >
            <FaEnvelope />
          </a>
        </div>
      </div>
    </footer>
  );
}
