import React, { useState } from "react";
import { CircularProgress, DialogContentText, TextField, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Card, Tooltip, Snackbar, makeStyles, IconButton, Grid, AppBar, Toolbar, Typography } from "@material-ui/core";
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { useTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import MuiAlert from '@material-ui/lab/Alert';
import DoneIcon from '@material-ui/icons/Done';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import Networker from './network';
import { Redirect } from 'react-router';

const NETWORK_ERROR = "Не удалось отправить заказ. Проверьте соединение с интернетом и перезагрузите страницу.";
const SUCCESS_MAKING_ORDER = "Заказ успешно отправлен!";
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const States = {
    LOADING: 1,
    LOADED: 2,
    GO_TO_LOGIN: 3,
    IDLE: 4,
}

const infoStyles = makeStyles((theme) => ({
    div: {
        display: "flex",
        direction: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
    },
}));

const useMenuElementStyles = makeStyles({
    root: {
        height: '100%',
        width: '100%',
        position: "relative",
        '&::before': {
            content: '""',
            display: "inline-block",
            width: "1px",
            height: "0",
            paddingBottom: "calc(100%)",
        },
        borderRadius: "25px",
    },
    content: {
        position: "absolute",
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    img: {
        height: "80%",
        width: "80%"
    },
    info: {

        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
});

function CheckoutDialog(props) {

    function clearBasket() {
        props.upd(null, null);
    }

    function sendRequest() {
        var dishes = new Map(JSON.parse(localStorage['basket']));
        var dishesArr = [];
        for (let dishString of dishes.keys()) {
            let dish = JSON.parse(dishString);
            let amount = dishes.get(dishString);
            dishesArr.push({ "id": dish.id, "amount": amount });
        }
        Networker.makeRequest("/cli/order", {
            "phone": localStorage['phoneNumber'],
            "secret": localStorage['secret'],
            "address": address,
            "data": JSON.stringify(dishesArr),
        })
            .subscribe({
                next: (result) => {
                    if (result.status.response >= 999) {
                        props.setSnackBarMessage(NETWORK_ERROR);
                        props.setSnackBarSeverity("error");
                        props.setSnackBarOpened(true);
                        setLoadingState(States.IDLE);
                    }
                    else if (result.status.response === 200) {
                        props.setSnackBarMessage(SUCCESS_MAKING_ORDER);
                        props.setSnackBarSeverity("success");
                        props.setSnackBarOpened(true);
                        clearBasket();
                        props.setOpened(false);
                    }
                    else {
                        props.setSnackBarMessage("Произошла ошибка при отправке заказа. Перенаправление на страницу входа...");
                        props.setSnackBarSeverity("error");
                        props.setSnackBarOpened(true);
                        setTimeout(() => setLoadingState(States.GO_TO_LOGIN), 3000);
                    }
                },
            });
    }

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [loadingState, setLoadingState] = useState(States.IDLE);
    const [address, setAddress] = useState('');

    let sum = 0;
    const handleClose = (e) => {
        props.setOpened(false);
    };
    let basket = new Map(JSON.parse(localStorage['basket']));
    for (let dishString of basket.keys()) {
        let dish = JSON.parse(dishString);
        sum += basket.get(dishString) * dish.price;
    }
    return (
        <div>
            <Dialog
                fullScreen={fullScreen}
                open={props.opened}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
            >
                {(loadingState === States.LOADING) && sendRequest()}
                {loadingState === States.GO_TO_LOGIN && <Redirect to="/login" />}
                <DialogTitle id="responsive-dialog-title">Оформление заказа</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Box mt={3} display={(loadingState === States.LOADING) ? "flex" : "none"}
                            style={{
                                height: '100%',
                                width: '100%',
                                margin: 0
                            }}
                            justifyItems="center"
                            justifyContent="center">
                            <CircularProgress />
                        </Box>
                    </DialogContentText>
                    {props.opened && (loadingState !== States.LOADING) &&
                        <div>
                            <Typography
                                variant="body1"
                                style={{
                                    "textAlign": "center",
                                }}>
                                Общая сумма заказа: {sum} грн
                            </Typography>
                            <TextField type="address"
                                onChange={(e) => setAddress(e.target.value)}
                                value={address}
                                placeholder="Адрес доставки"
                                disabled={loadingState === States.LOADING || loadingState === States.LOADED}
                                style={{
                                    'width': '100%',
                                    'marginTop': '20px',
                                    "minWidth": !fullScreen ? "300px" : "100px",
                                }} />
                        </div>}
                </DialogContent>
                <DialogActions>
                    <Button autoFocus
                        color="primary"
                        disabled={loadingState === States.LOADING || loadingState === States.LOADED}
                        onClick={setLoadingState.bind(this, States.LOADING)}>
                        Заказать
                    </Button>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

function MenuElement(props) {
    const dish = props.dish;
    const classes = useMenuElementStyles();

    function onMinusButton() {
        props.upd(props.dishString, -1);
    }

    function onPlusButton() {
        props.upd(props.dishString, +1);
    }

    return (
        <Card className={classes.root}>
            <div className={classes.content}>
                <img className={classes.img} alt="" src={dish.photo} />
                <Typography variant="h5" className={classes.title}>{dish.name}</Typography>
                <div className={classes.info}>
                    <IconButton color="primary" onClick={onMinusButton}>
                        {props.howMany === 1 && <RemoveShoppingCartIcon />}
                        {props.howMany !== 1 && <RemoveIcon />}
                    </IconButton>
                    <Typography variant="body1" className={classes.subtitle}>{props.howMany} шт.</Typography>
                    <IconButton color="primary" disabled={props.howMany >= 8} onClick={onPlusButton}>
                        <AddIcon />
                    </IconButton>
                </div>
            </div>
        </Card>
    );
}

function Basket() {

    function getBasket()
    {
        if (localStorage.getItem("basket") === null)
            localStorage.setItem('basket', "[]");
        return localStorage.getItem("basket");
    }
    const [basketMapString, setBasketMapString] = useState(getBasket());

    function updateBasketMap(who, val) {
        let mp = new Map(JSON.parse(basketMapString));
        /// Special case: if who===null, set basket to empty
        if (who !== null) {
            if (!mp.has(who))
                mp.set(who, 0);
            mp.set(who, mp.get(who) + val);
            if (mp.get(who) === 0)
                mp.delete(who);
            let res = JSON.stringify([...mp]);
            setBasketMapString(res);
            localStorage['basket'] = res;
        }
        else{
            setBasketMapString('[]');
            localStorage['basket'] = '[]';
        }
    }

    function processBasket() {
        let finalResult = [];
        let mp = new Map(JSON.parse(basketMapString));
        for (let dishString of mp.keys()) {
            const dish = JSON.parse(dishString);
            const amount = mp.get(dishString);
            finalResult.push(<Grid item xs={12} sm={6} md={4} style={{ padding: "15px" }}>
                <MenuElement dish={dish} howMany={amount} dishString={dishString} upd={updateBasketMap} />
            </Grid>);
        }
        return finalResult;
    }

    const classes = infoStyles();
    const history = useHistory();
    const [snackBarOpened, setSnackBarOpened] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('');
    const [openedDialog, setOpenedDialog] = useState(false);

    return (
        <div>
            <Grid container direction="column">
                <Grid item>
                    <AppBar position="fixed">
                        <Toolbar>
                            <div className={classes.div}>
                                <Tooltip title="Вернуться в меню">
                                    <IconButton color="secondary" className={classes.backButton} onClick={() => history.push("/")}>
                                        <KeyboardBackspaceIcon />
                                    </IconButton>
                                </Tooltip>
                                <Typography variant="h6" className={classes.title}>
                                    Корзина
                                </Typography>
                                <Tooltip title="Оформить заказ">
                                    <IconButton onClick={setOpenedDialog.bind(this, true)} color="secondary" disabled={basketMapString === '[]'}>
                                        <DoneIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </Toolbar>
                    </AppBar>
                </Grid>
                <Grid item container
                    direction="row"
                    style={{ marginTop: "70px" }}
                >
                    <Grid item xs={0} sm={1} lg={2} />
                    <Grid item container
                        justifyItems="center"
                        justifyContent="center"
                        alignItems="center"
                        direction="row"
                        xs={12}
                        sm={10}
                        lg={8}
                    >
                        {processBasket()}
                    </Grid>
                    <Grid item xs={0} sm={1} lg={2} />
                </Grid>
            </Grid>
            <Snackbar open={snackBarOpened} autoHideDuration={6000} onClose={setSnackBarOpened.bind(this, false)}>
                <Alert onClose={setSnackBarOpened.bind(this, false)} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
            <Box display={(basketMapString === '[]') ? "flex" : "none"}
                style={{
                    height: 'calc(100vh - 100px)',
                    width: '100%',
                    margin: 0
                }}
                justifyItems="center"
                justifyContent="center"
                alignItems="center"
                alignContent="center"
                flexDirection="column"
            >
                <Typography variant="h4">Корзина пуста!</Typography>
            </Box>
            <CheckoutDialog opened={openedDialog}
                setOpened={setOpenedDialog}
                setSnackBarMessage={setSnackBarMessage}
                setSnackBarOpened={setSnackBarOpened}
                setSnackBarSeverity={setSnackBarSeverity}
                upd={updateBasketMap} />
        </div>
    );
}

export default Basket;