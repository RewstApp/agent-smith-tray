import Button from "@mui/material/Button";
import { Link } from "../models";
import Typography from "@mui/material/Typography";

type LinkButtonProps = {
  link: Link;
  onClick?: (link: Link) => void;
};

export default function LinkButton({ link, onClick }: LinkButtonProps) {
  return (
    <Button
      variant="contained"
      onClick={() => onClick?.(link)}
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
  );
}
