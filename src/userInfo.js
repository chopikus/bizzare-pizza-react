import React, { useState } from "react";
import { makeStyles, IconButton, Grid, Box, CircularProgress, AppBar, Toolbar, Typography } from "@material-ui/core";
import { Redirect } from 'react-router';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { useHistory } from 'react-router-dom';

const States = {
    LOADING: 1,
    LOADED: 2,
    GO_TO_LOGIN: 3,
    NOT_OPENED: 4,
}

const headerStyles = makeStyles((theme) => ({
    div: {
        display: "flex",
        direction: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backButtonRight: {
        opacity: 0,
    }
}));

function UserInfo() {

    function fetchUserInfo() {

    }

    const [loadingState, setLoadingState] = useState(States.LOADING);
    const classes = headerStyles();
    const history = useHistory();
    return (
        <div>
            {loadingState === States.GO_TO_LOGIN && <Redirect to="/login" />}
            {loadingState === States.LOADING && fetchUserInfo()}
            <Grid container direction="column">
                <Grid item>
                    <AppBar position="fixed">
                        <Toolbar>
                            <div className={classes.div}>
                                <IconButton color="secondary" className={classes.backButton} onClick={()=> history.push("/")}>
                                    <KeyboardBackspaceIcon />
                                </IconButton>
                                <Typography variant="h6" className={classes.title}>
                                    Информация о пользователе
                                </Typography>
                                <IconButton color="secondary" className={classes.backButtonRight}>
                                    <KeyboardBackspaceIcon />
                                </IconButton>
                            </div>
                        </Toolbar>
                    </AppBar>
                </Grid>
                <h1>Hello!</h1>
            </Grid>
            <Box mt={3} display={(loadingState === States.LOADING) ? "flex" : "none"}
                style={{
                    height: 'calc(100vh - 100px)',
                    width: '100%',
                    margin: 0
                }}
                justifyItems="center"
                justifyContent="center">
                <CircularProgress />
            </Box> {/* show circular progress bar when network request is loading*/}
        </div>
    );
}

export default UserInfo;