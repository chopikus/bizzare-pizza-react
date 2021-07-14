import React, { useState } from 'react';
import { Typography, TextField, Box, Button, makeStyles, CircularProgress, Snackbar} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import Networker from './network';
import {Redirect} from 'react-router';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const States = {
    LOADING: 1,
    WELCOME: 2,
    ENTER_CODE: 3,
    ENTER_CODE_WITH_NAME: 4,
    MEMORY_CHECK: 5,
    ACCESS_GRANTED: 6,
};

const REQUEST_ERROR_MESSAGE = "Не удалось отправить запрос. Попробуйте ещё раз!";
const SECRET_ERROR_MESSAGE = "Произошла ошибка. Проверьте правильность кода!";
const makeStyle = makeStyles(theme => ({
    root: {
        minHeight: '100vh',
        width: '100vw',
        margin: 0
    },
    logo: {
        marginBottom: "15px",
        [theme.breakpoints.up('lg')]: {
            marginTop: "-50px",
        }
    }
}));

function Login(props) {
    ///////// doing first network check when created function
    const [loginState, setLoginState] = useState(States.MEMORY_CHECK);
    const [snackBarOpened, setSnackBarOpened] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('');

    function resetTextFields()
    {
        document.getElementById("text-field-1").value = "";
        document.getElementById("text-field-2").value = "";
    }

    function figureOutRequest(history) {

        let curLoginState = loginState;
        if (curLoginState === States.MEMORY_CHECK)
        {
            if (!localStorage['phoneNumber'] || !localStorage['secret']){
                setLoginState(States.WELCOME);
                return;
            }
            Networker.makeRequest("/cli/auth/login", { 
                "phone": localStorage['phoneNumber'],
                "secret": localStorage['secret']})
            .subscribe({
                next: (result) => {
                    if (result.status.response !== 200) 
                        setLoginState(States.WELCOME);
                    else
                        setLoginState(States.ACCESS_GRANTED);
                },
            });
        }
        if (curLoginState === States.LOADING)
            return;
        if (curLoginState === States.WELCOME) {
            setLoginState(States.LOADING);
            const phoneNumber = document.getElementById("text-field-1").value;
            localStorage['phoneNumber'] = phoneNumber;
            ////TODO check phoneNumber
            Networker.makeRequest("/cli/auth/check", { "phone": phoneNumber}).subscribe({
                next: (result) => {
                    if (result.status.response !== 200) {
                        setSnackBarMessage(REQUEST_ERROR_MESSAGE);
                        setSnackBarSeverity("error");
                        setSnackBarOpened(true); // showing error... and going back to same state
                        setLoginState(curLoginState);
                    }
                    else{
                        if (!result.data.verified){
                            setLoginState(States.ENTER_CODE_WITH_NAME);
                            resetTextFields();
                        }
                        else{
                            setLoginState(States.ENTER_CODE);
                            resetTextFields();
                        }
                    }
                },
            });
        }
        else if (curLoginState===States.ENTER_CODE_WITH_NAME || curLoginState===States.ENTER_CODE)
        {
            setLoginState(States.LOADING);
            const phoneNumber = localStorage['phoneNumber'];
            const name = curLoginState===States.ENTER_CODE_WITH_NAME ? document.getElementById("text-field-1").value : "";
            //// TODO check name
            const secret = document.getElementById(curLoginState===States.ENTER_CODE ? "text-field-1" : "text-field-2").value;
            let query = null;
            if (curLoginState===States.ENTER_CODE_WITH_NAME)
                query = "/cli/auth/new";
            else
                query = "/cli/auth/login"; /// which query should be for the request??
            localStorage['name'] = name;
            localStorage['secret'] = secret; //oh storing name and secret in localstorage btw
            Networker.makeRequest(query, { "phone": phoneNumber, "name": name, "secret": secret}).subscribe({
                next: (result) => {
                    console.log(result.status.response);
                    if (result.status.response !== 200) {
                        setSnackBarMessage(SECRET_ERROR_MESSAGE);
                        setSnackBarSeverity("error");
                        setSnackBarOpened(true); // showing error... and going back to same state
                        setLoginState(curLoginState);
                    }
                    else{
                        setLoginState(States.ACCESS_GRANTED);
                    }
                },
            });
        }
    }

    function getTextField1()
    {
        if (loginState===States.WELCOME)
            return {
                label: 'Номер телефона',
                placeholder: '+38(096)-123-45-67'
            };
        else if (loginState===States.ENTER_CODE)
            return {label: 'Код подтверждения', placeholder: 'XXXX'};
        else if (loginState===States.ENTER_CODE_WITH_NAME)
            return {label: 'Как вас зовут?', placeholder: ""};
        else
            return {label: 'Загрузка..', placeholder: ''};
    }

    function getTextField2()
    {
        if (loginState===States.WELCOME || loginState===States.ENTER_CODE)
            return {
                hidden: true,
                label: "",
                placeholder: ""
            };
        else if (loginState===States.ENTER_CODE_WITH_NAME)
            return {hidden: false, label: 'Код подтверждения', placeholder: 'XXXX'};
        else
            return {hidden: true, label: 'Загрузка', placeholder: "Загрузка"};
    }

    const myStyle = makeStyle();
    
    return (
        <div>
            {loginState===States.ACCESS_GRANTED && <Redirect to="/menu" />}
            {loginState===States.MEMORY_CHECK && figureOutRequest()}
        <Box
            display={(loginState===States.LOADING || loginState===States.MEMORY_CHECK) ? "none" : "flex"}
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
            className={myStyle.root}
        >
            <Box className={myStyle.logo} width={150} height={150} component="img" src="logo.png" />
            <Box>
                <Typography variant="h3" align="center">Bizzare Pizza</Typography>
            </Box>
            <Box my={1.5}>
                <Typography variant="body1" align="center">Для продолжения введите номер телефона.</Typography>
            </Box>
            <TextField
                id="text-field-1"
                label={getTextField1().label}
                placeholder={getTextField1().placeholder}
            />
            <Box hidden={getTextField2().hidden}>
                <TextField
                    id="text-field-2"
                    label={getTextField2().label}
                    placeholder={getTextField2().placeholder} />
            </Box>
            <Box mt={3}>
                <Button variant="contained" color="primary" onClick={figureOutRequest}>
                    Продолжить
                </Button>
            </Box> {/* do not show button when loading :|*/}
            <Snackbar open={snackBarOpened} autoHideDuration={6000} onClose={setSnackBarOpened.bind(this, false)}>
                <Alert onClose={setSnackBarOpened.bind(this, false)} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar> {/*showing snackbar for various kinds of errors*/}
        </Box>
        <Box mt={3} display={(loginState===States.LOADING || loginState===States.MEMORY_CHECK) ? "flex" : "none"} 
            className={myStyle.root}
            alignItems="center"
            justifyContent="center">
                <CircularProgress />
        </Box> {/* show circular progress bar when network request is loading*/}
        </div>
    );
}

export default Login;
