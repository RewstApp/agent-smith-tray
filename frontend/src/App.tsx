import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { ShowWindow } from "../wailsjs/go/main/App";
import { EventsOn } from "../wailsjs/runtime/runtime";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Refresh from "@mui/icons-material/Refresh";
import Typography from "@mui/material/Typography";

type Link = {
  name: string;
  url: string;
};

const App = () => {
  const [userInteractionHtml, setUserInteractionHtml] = useState("");
  const [links, setLinks] = useState<Link[]>([]);
  const [currentLink, setCurrentLink] = useState<Link | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    EventsOn("message:user_interaction_html", (html) => {
      setUserInteractionHtml(html);
      ShowWindow();
    });

    EventsOn("message:clear", () => {
      setUserInteractionHtml("");
    });

    const handleContextMenu = (e: any) => e.preventDefault();
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const handleLinkClick = (selectedLink: Link) => {
    setCurrentLink(selectedLink);
  };

  const handleBack = () => {
    setCurrentLink(null);
  };

  const handleRefresh = () => {
    if (!iframeRef.current || !currentLink) {
      return;
    }

    iframeRef.current.src = currentLink.url;
  };

  if (userInteractionHtml != "") {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: userInteractionHtml }}
        style={{
          width: "100%",
          height: "100vh",
        }}
      />
    );
  }

  if (!currentLink) {
    return (
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100vh" }}
      >
        {links.map((link, index) => (
          <Button
            key={`link-${index}`}
            variant="contained"
            onClick={() => handleLinkClick(link)}
          >
            <Typography variant="h6">{link.name}</Typography>
          </Button>
        ))}
        {links.length === 0 && <Typography variant="h6">No links</Typography>}
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Button
            color="inherit"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back to Links
          </Button>
          <Button
            color="inherit"
            onClick={handleRefresh}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>
        </Toolbar>
      </AppBar>
      <iframe
        ref={iframeRef}
        src={currentLink.url}
        style={{
          width: "100%",
          padding: 0,
          margin: 0,
          flexGrow: 1,
          border: "none",
        }}
      />
    </Box>
  );
};

export default App;
