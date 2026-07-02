/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing maplibre-gl which uses WebAssembly workers
  webpack: (config) => {
    // maplibre-gl references worker files via URL — mark them as assets
    config.module.rules.push({
      test: /maplibre-gl.*worker.*\.js$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
