import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ignoreDuringBuilds: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qakeisrqjkykrgspbior.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
