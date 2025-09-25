import React from "react";
import { createRoot } from "react-dom/client";
import MainWindow from "./components/main-window";
import "./index.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2BB5B6",
      dark: "#009490",
    },
  },
});

const root = createRoot(document.body);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <MainWindow />
    </ThemeProvider>
  </React.StrictMode>
);
