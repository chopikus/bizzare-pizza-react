import React from "react";
import { AppBar, Toolbar, Typography, IconButton, makeStyles} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import {Redirect} from 'react-router';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

function Header() {
    const classes = useStyles();
    
    return <AppBar position="fixed">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        Bizzare Pizza
                    </Typography>
                </Toolbar>
            </AppBar>
}

export default Header;