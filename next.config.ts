import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'i.discogs.com',
      'st.discogs.com'
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },
};

export default nextConfig;
