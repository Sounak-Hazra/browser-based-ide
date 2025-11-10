import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com"
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/container/socket/:path*",
        destination: "http://localhost:8080/api/container/socket/:path*", // 👈 proxy WebSocket here
      },
      // {
      //   source: "/api/container/socket/:path*",
      //   destination: "http://localhost:8080/api/container/socket/:path*", // ✅ WebSocket proxy
      // },

      // {
      //   source: "/api/:path*",
      //   destination: "http://localhost:8080/api/:path*", // 👈 proxy WebSocket here
      // }
    ];
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {

            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',

          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      }
    ]
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent Webpack from bundling dockerode’s native deps
      config.externals = [...(config.externals || []), "dockerode", "ssh2"];
    }
    return config;
  },

  reactStrictMode: false
};

export default nextConfig;
