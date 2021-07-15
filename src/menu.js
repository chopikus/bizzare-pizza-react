import React, { useState } from "react";
import { Typography, makeStyles, Grid, Card, Box, CircularProgress } from "@material-ui/core";
import Header from "./header";
import Networker from "./network";
import { Redirect } from 'react-router';

const States = {
    LOADING: 1,
    LOADED: 2,
    GO_TO_LOGIN: 3,
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

function MenuElement(props) {
    const dish = props.dish;

    const classes = useMenuStyles();
    return (<Card className={classes.root}>
        <div className={classes.content} >
            <img className={classes.img} alt="" src={dish.photo} />
            <Typography variant="h5" className={classes.title}>{dish.name}</Typography>
            <Typography variant="body1" className={classes.subtitle}>{dish.price} грн/{dish.amount} {dish.measurement_unit}</Typography>
        </div>
    </Card>);
}

function processMenuQuery(dishes)
{
    console.log(dishes);
    let finalResult = []
    for (let dish of dishes)
    {
        finalResult.push(<Grid item xs={12} sm={6} md={4} style={{ padding: "15px" }}>
                        <MenuElement dish={dish}/>
                        </Grid>);
    }
    return finalResult;
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
                        ///TODO 
                    }
                    else if (result.status.response !== 200) {
                        setLoadingState(States.GO_TO_LOGIN);
                        ///TODO
                    }
                    else{
                        setMenu(processMenuQuery(result.data));
                        setLoadingState(States.LOADED);
                    }
                },
            });
    }

    const [loadingState, setLoadingState] = useState(States.LOADING);
    const [menu, setMenu] = useState([]);

    return (
        <div>
            {loadingState === States.GO_TO_LOGIN && <Redirect to="/login" />}
            {loadingState === States.LOADING && fetchMenu()}
            <Grid container direction="column">
                <Grid item>
                    <Header />
                </Grid>
                <Grid item container
                    direction="row"
                    style={{ marginTop: "70px" }}
                >
                    <Grid item xs={0} sm={1} lg={2} />
                    <Grid item container
                        alignItems="center"
                        justifyContent="center"
                        direction="row"
                        xs={12}
                        sm={10}
                        lg={8}
                    >
                        {menu}
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
                alignItems="center"
                justifyContent="center">
                <CircularProgress />
            </Box> {/* show circular progress bar when network request is loading*/}
        </div>
    );
}

export default Menu;