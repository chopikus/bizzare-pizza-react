import React, { useState } from "react";
import { ListSubheader, List, ListItem, ListItemIcon, ListItemText, Button, Snackbar, makeStyles, IconButton, Grid, Box, CircularProgress, AppBar, Toolbar, Typography } from "@material-ui/core";
import { Redirect } from 'react-router';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { useHistory } from 'react-router-dom';
import Networker from './network';
import MuiAlert from '@material-ui/lab/Alert';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const NETWORK_ERROR = "Не удалось отправить запрос. Проверьте соединение с интернетом и перезагрузите страницу.";

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

function OrderList() {

    function fetchOrderList() {
        ///TODO other types of orders, currently not supported
        Networker.makeRequest("/cli/maybeorder/list", {
            "phone": localStorage['phoneNumber'],
            "secret": localStorage['secret'],
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
                        let newOrderList = [];
                        newOrderList.push(<ListSubheader>В обработке</ListSubheader>);
                        for (let order of result.data)
                        {
                            newOrderList.push(<ListItem button>
                                <ListItemIcon>
                                    <HourglassEmptyIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Заказ №"+order.number} secondary={"Адрес:"+order.address} />
                            </ListItem>);
                        }
                        setOrderList(newOrderList);
                        setLoadingState(States.LOADED);
                        return true;
                    }
                },
            });
            return false;
    }

    const [loadingState, setLoadingState] = useState(States.LOADING);
    const [snackBarOpened, setSnackBarOpened] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('');
    const [orderList, setOrderList] = useState([]);

    const classes = infoStyles();
    const history = useHistory();

    return (
        <div>
            {loadingState === States.GO_TO_LOGIN && <Redirect to="/login" />}
            {loadingState === States.LOADING && fetchOrderList()}
            <Grid container direction="column">
                <Grid item>
                    <AppBar position="fixed">
                        <Toolbar>
                            <div className={classes.div}>
                                <IconButton color="secondary" className={classes.backButton} onClick={() => history.push("/")}>
                                    <KeyboardBackspaceIcon />
                                </IconButton>
                                <Typography variant="h6" className={classes.title}>
                                    Список заказов
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
                        <List aria-label="main mailbox folders">
                            {orderList}
                        </List>
                    </div>
                </Grid>}
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
            </Box> {/* show circular progress bar when userinfo is loading*/}
            <Snackbar open={snackBarOpened} autoHideDuration={6000} onClose={setSnackBarOpened.bind(this, false)}>
                <Alert onClose={setSnackBarOpened.bind(this, false)} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default OrderList;