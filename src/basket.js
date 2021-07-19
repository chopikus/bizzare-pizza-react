import React, { useState } from "react";
import { useMediaQuery, Dialog, DialogTitle, DialogContent, List, DialogActions, Button, Box, Card, Tooltip, Snackbar, makeStyles, IconButton, Grid, AppBar, Toolbar, Typography } from "@material-ui/core";
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { useTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import MuiAlert from '@material-ui/lab/Alert';
import DoneIcon from '@material-ui/icons/Done';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
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
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const dish = props.dish;
    const handleClose = (e) => {
        props.setOpened(false);
    };

    return (
        <div>
            <Dialog
                fullScreen={fullScreen}
                open={props.opened}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">Оформление заказа</DialogTitle>
                <DialogContent>
                    {/*<DialogContentText>
                        <Box mt={3} display={(loadingInfoState === States.LOADING) ? "flex" : "none"}
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
                        {props.opened && (loadingInfoState === States.LOADED || loadingInfoState === States.ERROR) &&*/}
                        <div>
                            <Typography variant="body1">
                                Общая сумма заказа: 888 грн
                            </Typography>
                            <List>
                                
                            </List>
                        </div>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus color="primary">
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
            {console.log("hello!")}
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

    const [basketMapString, setBasketMapString] = useState(localStorage['basket']);

    function updateBasketMap(who, val) {
        let mp = new Map(JSON.parse(basketMapString));
        if (!mp.has(who))
            mp.set(who, 0);
        mp.set(who, mp.get(who) + val);
        if (mp.get(who) === 0)
            mp.delete(who);
        let res = JSON.stringify([...mp]);
        setBasketMapString(res);
        localStorage['basket'] = res;
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
                                    <IconButton onClick={setOpenedDialog.bind(this, true)}color="secondary" disabled={basketMapString === '[]'}>
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
            <CheckoutDialog opened={openedDialog} setOpened={setOpenedDialog} />
        </div>
    );
}

export default Basket;