import { useEffect, useState } from "react";

type Link = {
  name: string;
  url: string;
};

export default function MainWindow() {
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    window.electronAPI.onUpdateLinks((linksJson) => {
      setLinks(JSON.parse(linksJson));
    });

    return () => window.electronAPI.clearUpdateLinks();
  }, []);

  return (
    <div>
      {links.map((link) => (
        <a href={link.url}>{link.name}</a>
      ))}
    </div>
  );
}
