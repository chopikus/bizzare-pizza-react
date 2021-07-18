import React, { useState, Fragment } from "react";
import { Snackbar, Divider, ListItemIcon, Drawer, IconButton, AppBar, Toolbar, Select, MenuItem, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, makeStyles, Grid, Card, Box, CircularProgress, Dialog, DialogActions, DialogContent, useMediaQuery, DialogTitle, DialogContentText, Button, } from "@material-ui/core";
import Networker from "./network";
import { Redirect } from 'react-router';
import { Link } from "react-router-dom";
import { useTheme } from '@material-ui/core/styles';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import MenuIcon from '@material-ui/icons/Menu';
import ShoppingBasketSharpIcon from '@material-ui/icons/ShoppingBasketSharp';
import InfoIcon from '@material-ui/icons/Info';
import ListAltIcon from '@material-ui/icons/ListAlt';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import MuiAlert from '@material-ui/lab/Alert';

const States = {
    LOADING: 1,
    LOADED: 2,
    GO_TO_LOGIN: 3,
    NOT_OPENED: 4,
    ERROR: 5,
}

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useHeaderStyles = makeStyles((theme) => ({
    myTitle: {
        marginRight: "auto",
    },
    mySelect: {
        color: "#ffffff",
        marginLeft: "auto",
        marginTop: "3px",
    },
    div: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        padding: "0px",
        marginRight: "20px",
    }
}));

const useDrawerStyles = makeStyles((theme) => ({
    list: {
        width: "250px",
    },
    bizzare: {
        marginTop: "11px",
        marginBottom: "12px",
    }
}));

function MyMenuDrawer(props) {
    const classes = useDrawerStyles();
    return <Fragment>
        <Drawer open={props.opened} onClose={props.setOpened.bind(this, false)}>
            <List className={classes.list}>
                <Typography variant="h6" className={classes.bizzare} align="center" color='textSecondary'>
                                Bizzare Pizza
                </Typography>
                <Divider />
                <ListItem button key="Корзина">
                    <ListItemIcon><ShoppingBasketSharpIcon /></ListItemIcon>
                    <ListItemText primary="Корзина" />
                </ListItem>
                <ListItem button key="Список заказов">
                    <ListItemIcon><ListAltIcon /></ListItemIcon>
                    <ListItemText primary="Список заказов" />
                </ListItem>
                <ListItem button key="Информация о пользователе" component={Link} to={"/userinfo"}>
                    <ListItemIcon><InfoIcon /></ListItemIcon>
                    <ListItemText primary="Информация о пользователе" />
                </ListItem>
                <Divider />
                <ListItem button key="Назад в меню" onClick={props.setOpened.bind(this, false)}>
                    <ListItemIcon><KeyboardBackspaceIcon /></ListItemIcon>
                    <ListItemText primary="В меню" />
                </ListItem>
            </List>
        </Drawer>
    </Fragment>;
}

function Header(props) {

    const selectCategory = (event) => {
        props.setFavCategory(event.target.value);
    };
    const [isDrawerOpened, setDrawerOpened] = useState(false);
    const classes = useHeaderStyles();
    let list = [];
    let i = 0;
    for (let category of props.categoriesList) {
        list.push(<MenuItem value={i} id={i}>{category}</MenuItem>);
        i++;
    }
    return (<div>
        <MyMenuDrawer opened={isDrawerOpened} setOpened={setDrawerOpened} />
        <AppBar position="fixed">
            <Toolbar>
                <Grid container direction="row">
                    <Grid item xs={0} sm={1} lg={2} />
                    <Grid item xs={12} sm={10} lg={8}>
                        <div className={classes.div}>
                            <IconButton color="secondary" className={classes.button}>
                                <MenuIcon onClick={setDrawerOpened.bind(this, true)} />
                            </IconButton>
                            <Typography variant="h6" className={classes.myTitle}>
                                Bizzare Pizza
                            </Typography>
                            {list.length>0 && 
                            <Select
                                labelId="demo-simple-select-placeholder-label-label"
                                id="demo-simple-select-placeholder-label"
                                className={classes.mySelect}
                                value={props.favCategory}
                                onChange={selectCategory}
                                disableUnderline
                            >
                                {list}
                            </Select> }
                        </div>
                    </Grid>
                    <Grid item xs={0} sm={1} lg={2} />
                </Grid>
            </Toolbar>
        </AppBar>
    </div>);
}

const useMenuStyles = makeStyles({
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
    title: {
        flexGrow: "1",
    },
    subtitle: {
        flexGrow: "2",
    }
});

function DishInfoDialog(props) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [loadingInfoState, setLoadingInfoState] = useState(States.LOADING);
    const [dishDescription, setDishDescription] = useState();
    const [ingredientList, setIngredientList] = useState([]);
    const handleClose = (e) => {
        props.setOpened(false);
        setLoadingInfoState(States.LOADING);
    };
    const dish = props.dish;

    function fetchDishInfo() {
        Networker.makeRequest("/cli/dish/info", {
            "phone": localStorage['phoneNumber'],
            "secret": localStorage['secret'],
            "data": JSON.stringify({ "id": dish.id }),
        })
            .subscribe({
                next: (result) => {
                    console.log(result.data);
                    if (result.status.response >= 999) {
                        setLoadingInfoState(States.ERROR);
                        setDishDescription("Произошла ошибка при получении данных о блюде :(");
                        setIngredientList([]);
                    }
                    else if (result.status.response !== 200) {
                        setLoadingInfoState(States.GO_TO_LOGIN);
                    }
                    else {
                        setDishDescription(result.data.description);
                        setLoadingInfoState(States.LOADED);
                        let finalIngredientList = []
                        for (let ingredient of result.data.ingredients) {
                            finalIngredientList.push(<ListItem>
                                <ListItemAvatar>
                                    <PlayArrowIcon />
                                </ListItemAvatar>
                                <ListItemText primary={ingredient.name} secondary={ingredient.amount + " " + ingredient.measurement_unit} />
                            </ListItem>);
                        }
                        setIngredientList(finalIngredientList);
                    }
                },
            });
    }

    return (
        <div>
            {props.opened && (loadingInfoState === States.LOADING) && fetchDishInfo()}
            {loadingInfoState === States.GO_TO_LOGIN && <Redirect to="/login" />}
            <Dialog
                fullScreen={fullScreen}
                open={props.opened}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">{dish.name}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
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
                    {props.opened && (loadingInfoState === States.LOADED || loadingInfoState===States.ERROR) &&
                        <div>
                            <Typography variant="body1">
                                {dishDescription}
                            </Typography>
                            <List>
                                {ingredientList}
                            </List>
                        </div>}
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="primary">
                        Добавить в корзину
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
    const [openedDialog, setOpenedDialog] = useState(false);
    const classes = useMenuStyles();

    return (
        <Card className={classes.root}>
            <div className={classes.content} onClick={setOpenedDialog.bind(this, true)}>
                <img className={classes.img} alt="" src={dish.photo} />
                <Typography variant="h5" className={classes.title}>{dish.name}</Typography>
                <Typography variant="body1" className={classes.subtitle}>{dish.price} грн/{dish.amount} {dish.measurement_unit}</Typography>
            </div>
            <DishInfoDialog opened={openedDialog} setOpened={setOpenedDialog} dish={dish}/>
        </Card>
    );
}

function processMenuQuery(dishes, favCategory, categories) {
    let finalResult = []
    for (let dish of dishes) {
        if (favCategory === 0 || dish.category_name === categories[favCategory])
            finalResult.push(<Grid item xs={12} sm={6} md={4} style={{ padding: "15px" }}>
                <MenuElement dish={dish} />
            </Grid>);
    }
    return finalResult;
}

function getCategoriesList(dishes) {
    let set = new Set();
    for (let dish of dishes) {
        set.add(dish.category_name);
    }
    let a = Array.from(set);
    a.unshift("Все блюда");
    return a;
}

function Menu() {
    function fetchMenu() {
        Networker.makeRequest("/cli/dish/list", {
            "phone": localStorage['phoneNumber'],
            "secret": localStorage['secret']
        })
            .subscribe({
                next: (result) => {
                    if (result.status.response >= 999) {
                        setSnackBarMessage("Произошла ошибка при загрузке меню :( Попробуйте перезагрузить страницу.");
                        setSnackBarSeverity("error");
                        setSnackBarOpened(true);
                    }
                    else if (result.status.response !== 200) {
                        setLoadingState(States.GO_TO_LOGIN);
                    }
                    else {
                        const data = result.data;
                        const categories = getCategoriesList(data);
                        setMenu(data);
                        setCategoriesList(categories);
                        setLoadingState(States.LOADED);
                    }
                },
            });
    }

    const [loadingState, setLoadingState] = useState(States.LOADING);
    const [snackBarOpened, setSnackBarOpened] = useState(false);
    const [snackBarSeverity, setSnackBarSeverity] = useState();
    const [snackBarMessage, setSnackBarMessage] = useState();
    const [menu, setMenu] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [favCategory, setFavCategory] = useState(0);

    return (
        <div>
            {loadingState === States.GO_TO_LOGIN && <Redirect to="/login" />}
            {loadingState === States.LOADING && fetchMenu()}
            <Grid container direction="column">
                <Grid item>
                    <Header categoriesList={categoriesList} favCategory={favCategory} setFavCategory={setFavCategory} />
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
                        {processMenuQuery(menu, favCategory, categoriesList)} {/* it's actually menu's data!*/}
                    </Grid>
                    <Grid item xs={0} sm={1} lg={2} />
                </Grid>
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
            <Snackbar open={snackBarOpened} autoHideDuration={6000} onClose={setSnackBarOpened.bind(this, false)}>
                <Alert onClose={setSnackBarOpened.bind(this, false)} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default Menu;