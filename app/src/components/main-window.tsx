import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Refresh from "@mui/icons-material/Refresh";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material";

type Link = {
  name: string;
  url: string;
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#2BB5B6",
      dark: "#009490",
    },
  },
});

export default function MainWindow() {
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    window.electronAPI.onUpdateLinks((linksJson) => {
      setLinks(JSON.parse(linksJson));
    });

    return () => window.electronAPI.clearUpdateLinks();
  }, []);

  const handleLinkClick = (selectedLink: Link) => {
    // TODO: setCurrentLink(selectedLink);
  };

  return (
    <ThemeProvider theme={theme}>
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
            sx={{
              borderRadius: "50px", // pill shape
              px: 4, // horizontal padding
              py: 1.5, // vertical padding
              fontWeight: "bold",
              textTransform: "none", // keep text as-is
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
                //backgroundColor: "#1565c0", // darker blue
              },
            }}
          >
            <Typography variant="h6">{link.name}</Typography>
          </Button>
        ))}
        {links.length === 0 && <Typography variant="h6">No links</Typography>}
      </Stack>
    </ThemeProvider>
  );
}
