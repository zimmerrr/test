const path = require("path");
const NodePolyFillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  target: "node", // Target node environment
  entry: "./src/server.js", // Entry point for your application
  output: {
    filename: "bundle.js", // Output file
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  plugins: [new NodePolyFillPlugin()],
  mode: "development", // Set mode to 'development' or 'production'
  resolve: {
    fallback: {
      child_process: false,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      path: require.resolve("path-browserify"),
      buffer: require.resolve("buffer/"),
      assert: require.resolve("assert/"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify"),
      url: require.resolve("url"),
      fs: false,
      net: false,
      tls: false,
    },
    alias: {
      "@mapbox/node-pre-gyp": false, // Exclude this package from the bundle
    },
  },
  externals: {
    "mongodb-client-encryption": "commonjs mongodb-client-encryption", // Prevent Webpack from bundling this module
  },
};
