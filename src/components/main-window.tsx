import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
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
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
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
