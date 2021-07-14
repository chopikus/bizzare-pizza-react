import React from 'react';
import { Typography, TextField, Box, Button, makeStyles } from '@material-ui/core';
import { flexbox } from '@material-ui/system';

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

function Login() {
    const myStyle = makeStyle();
    return (
        <Box
            display="flex"
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
                id="phone-number"
                label="Номер телефона"
                placeholder="+38(096)-123-45-67"
            />
            <TextField
                id="confirmation-code"
                label="Код подтверждения"
                placeholder="XXXX" />
            <Box mt={3}>
                <Button variant="contained" color="primary">
                    Продолжить
                </Button>
            </Box>
        </Box>
    );
}

export default Login;
