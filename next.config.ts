import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API: process.env.API,
  },
};

export default nextConfig;
