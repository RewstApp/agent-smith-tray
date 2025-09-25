const path = require("path");

module.exports = {
  mode: "development",
  target: "electron-main",
  entry: {
    main: "./src/main/index.ts",
    preload: "./src/main/preload.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js", ".ico"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.ico$/i,
        type: "asset/resource",
      },
    ],
  },
};
