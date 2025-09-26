import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "../../models";
import LinkButton from "./link-button";
import LinkView from "./link-view";

export default function MainWindow() {
  const [links, setLinks] = useState<Link[]>([]);
  const [currentLink, setCurrentLink] = useState<Link | null>(null);

  useEffect(() => {
    window.electronAPI.onUpdateLinks((linksJson) => {
      setLinks(JSON.parse(linksJson));
    });

    window.electronAPI.loadLinks().then((links) => setLinks(links));

    return () => window.electronAPI.clearUpdateLinks();
  }, []);

  const handleLinkClick = (selectedLink: Link) => {
    setCurrentLink(selectedLink);
  };

  const handleBack = () => {
    setCurrentLink(null);
  };

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
          <LinkButton
            key={`link-${index}`}
            link={link}
            onClick={handleLinkClick}
          />
        ))}
        {links.length === 0 && <Typography variant="h6">No links</Typography>}
      </Stack>
    );
  }

  return <LinkView link={currentLink} onBack={handleBack} />;
}
