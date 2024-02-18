import { Link, Typography } from "@mui/material";

export default function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            Developed by Potato Field🥔
            <Link color="inherit" href="https://github.com/Potato-Field/live-board.git">
                Github
            </Link>
        </Typography>
    );
}