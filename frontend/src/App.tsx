import { useState } from "react";
import logo from "./assets/images/logo-agent-smith.png";
import "./App.css";
import { Greet } from "../wailsjs/go/main/App";

function App() {
  const [resultText, setResultText] = useState(
    "Please enter your name below 👇"
  );
  const [name, setName] = useState("");
  const updateName = (e: any) => setName(e.target.value);
  const updateResultText = (result: string) => setResultText(result);

  function greet() {
    Greet(name).then(updateResultText);
  }

  const dashboardUrl = "https://pedroaviary-agent-smith.rew.st/s/home";

  return (
    <div
      style={{
        overflow: "hidden",
      }}
    >
      <iframe
        src={dashboardUrl}
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          padding: 0,
          margin: 0,
        }}
      />
    </div>
  );
}

export default App;
