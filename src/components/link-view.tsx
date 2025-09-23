import Box from "@mui/material/Box";
import { Link } from "../models";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Refresh from "@mui/icons-material/Refresh";
import { useRef } from "react";

type LinkViewProps = {
  link: Link;
  onBack?: () => void;
};

export default function LinkView({ link, onBack }: LinkViewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleRefresh = () => {
    if (!iframeRef.current) {
      return;
    }

    iframeRef.current.src = link.url;
  };

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
            onClick={() => onBack?.()}
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
        src={link.url}
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
}
