import React from "react";
import { createRoot } from "react-dom/client";
import MainWindow from "./components/main-window";
import "./index.css";

const root = createRoot(document.body);
root.render(
  <React.StrictMode>
    <MainWindow />
  </React.StrictMode>
);
