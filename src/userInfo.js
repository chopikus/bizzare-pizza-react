import React, { useState } from "react";
import { TextField, Button, Snackbar, makeStyles, IconButton, Grid, Box, CircularProgress, AppBar, Toolbar, Typography } from "@material-ui/core";
import { Redirect } from 'react-router';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { useHistory } from 'react-router-dom';
import Networker from './network';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const NETWORK_ERROR = "Не удалось отправить запрос. Проверьте соединение с интернетом и перезагрузите страницу.";
const CHANGED_SUCCESS = "Успешное изменение информации!";

const States = {
    LOADING: 1,
    LOADED: 2,
    GO_TO_LOGIN: 3,
    NOT_OPENED: 4,
    ERROR: 5,
    IDLE: 6,
}

const infoStyles = makeStyles((theme) => ({
    div: {
        display: "flex",
        direction: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backButtonRight: {
        opacity: 0,
    },
    main: {
        marginTop: "70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    changeButton: {
        marginTop: "30px",
    }
}));

function UserInfo() {

    function fetchUserInfo() {
        Networker.makeRequest("/cli/info/get", {
            "phone": localStorage.getItem('phoneNumber'),
            "secret": localStorage.getItem('secret'),
        })
            .subscribe({
                next: (result) => {
                    if (result.status.response >= 999) {
                        setSnackBarMessage(NETWORK_ERROR);
                        setSnackBarSeverity("error");
                        setSnackBarOpened(true);
                        setLoadingState(States.ERROR);
                    }
                    else if (result.status.response !== 200) {
                        setLoadingState(States.GO_TO_LOGIN);
                    }
                    else {
                        setInfo(result.data);
                        console.log(result.data);
                        setLoadingState(States.LOADED);
                    }
                },
            });
    }

    function updateData()
    {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        setRequestState(States.LOADING);
        Networker.makeRequest("/cli/info/update", {
            "phone": localStorage.getItem('phoneNumber'),
            "secret": localStorage.getItem('secret'),
            "name": name,
            "email": email 
        })
            .subscribe({
                next: (result) => {
                    if (result.status.response !== 200) {
                        setSnackBarMessage(NETWORK_ERROR);
                        setSnackBarSeverity("error");
                        setSnackBarOpened(true);
                        setRequestState(States.IDLE);
                    }
                    else {
                        setRequestState(States.IDLE);
                        setSnackBarMessage(CHANGED_SUCCESS);
                        setSnackBarSeverity("success");
                        setSnackBarOpened(true);
                    }
                },
            });
    }

    const [loadingState, setLoadingState] = useState(States.LOADING);
    const [requestState, setRequestState] = useState(States.IDLE);
    const [snackBarOpened, setSnackBarOpened] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('');
    const [info, setInfo] = useState();

    const classes = infoStyles();
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
                                <IconButton color="secondary" className={classes.backButton} onClick={() => history.push("/")}>
                                    <KeyboardBackspaceIcon />
                                </IconButton>
                                <Typography variant="h6" className={classes.title}>
                                    Информация
                                </Typography>
                                <IconButton color="secondary" className={classes.backButtonRight}>
                                    <KeyboardBackspaceIcon />
                                </IconButton>
                            </div>
                        </Toolbar>
                    </AppBar>
                </Grid>
                {loadingState === States.LOADED && <Grid item>
                    <div className={classes.main}>
                        <TextField label={localStorage.getItem('phoneNumber')} color="primary" disabled />
                        <TextField label={"секрет: "+info.secret} color="primary" disabled/>
                        <TextField id="name" label="Имя" color="primary" defaultValue={info.name}/>
                        <TextField id="email" label="Электропочта" color="primary" defaultValue={info.email}/>
                        <Button variant="contained" color="primary" className={classes.changeButton}
                                disabled={requestState === States.LOADING}
                                onClick={updateData}>
                            Изменить данные
                        </Button>
                    </div>
                </Grid>}
            </Grid>
            <Box mt={3} display={(loadingState === States.LOADING || loadingState === States.ERROR) ? "flex" : "none"}
                style={{
                    height: 'calc(100vh - 100px)',
                    width: '100%',
                    margin: 0
                }}
                justifyItems="center"
                justifyContent="center">
                <CircularProgress />
            </Box> {/* show circular progress bar when userinfo is loading*/}
            <Box mt={3} display={(requestState === States.LOADING) ? "flex" : "none"}
                justifyItems="center"
                justifyContent="center">
                <CircularProgress />
            </Box> {/*show progress bar when request for data change is made*/}
            <Snackbar open={snackBarOpened} autoHideDuration={6000} onClose={setSnackBarOpened.bind(this, false)}>
                <Alert onClose={setSnackBarOpened.bind(this, false)} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default UserInfo;