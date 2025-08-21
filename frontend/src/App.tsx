import { useEffect, useState } from "react";
import "./App.css";
import { ShowWindow } from "../wailsjs/go/main/App";
import { EventsOn } from "../wailsjs/runtime/runtime";

function App() {
  const [userInteractionHtml, setUserInteractionHtml] = useState("");

  useEffect(() => {
    EventsOn("message:user_interaction_html", (html) => {
      setUserInteractionHtml(html);
      ShowWindow();
    });
    EventsOn("message:clear", () => {
      setUserInteractionHtml("");
    });
  }, []);

  const dashboardUrl = "https://pedroaviary-customer-portal.rew.st/";

  return (
    <>
      {userInteractionHtml != "" ? (
        <div
          dangerouslySetInnerHTML={{ __html: userInteractionHtml }}
          style={{
            width: "100%",
            height: "100vh",
          }}
        />
      ) : (
        <iframe
          src={dashboardUrl}
          style={{
            width: "100%",
            height: "100vh",
            padding: 0,
            margin: 0,
            flexGrow: 1,
            border: "none",
          }}
        />
      )}
    </>
  );
}

export default App;
