/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          }, // replace this your actual origin
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
  // Configuración para ignorar advertencias específicas
  webpack: (config, { isServer }) => {
    // Ignorar advertencias específicas
    config.ignoreWarnings = [
      // Ignorar advertencias sobre APIs de Node.js no soportadas en Edge Runtime
      { message: /A Node.js API is used.*Edge Runtime/ },
      // Ignorar advertencias sobre serialización de cadenas grandes
      { message: /Serializing big strings/ },
    ];
    return config;
  },
};

module.exports = nextConfig;
