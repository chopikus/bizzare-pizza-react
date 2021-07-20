import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import React from "react";
import Login from "./login";
import Menu from "./menu";
import Basket from "./basket";
import UserInfo from "./userInfo";
import OrderList from "./orderlist";
import { CssBaseline } from "@material-ui/core";
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
const theme = createTheme({
  palette: {
    primary: {
      main: '#008577',
    },
    secondary: {
      main: '#ffffff',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <CssBaseline />
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="(/menu|/)/">
            <Menu />
          </Route>
          <Route path="/userinfo">
            <UserInfo />
          </Route>
          <Route path="/basket">
            <Basket />
          </Route>
          <Route path="/orderlist">
            <OrderList />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>);
}

export default App;
