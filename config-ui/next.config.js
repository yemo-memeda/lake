module.exports = {
  // reactStrictMode: true,
  // basePath: '/',
  pageExtensions: ["index.jsx"],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
}
module.exports = {

}
