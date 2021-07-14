import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import React from "react";
import Login from "./login";
import { CssBaseline } from "@material-ui/core";
function App() {
  return (<Router>
    <CssBaseline />
    <Switch>
      <Route path="/login">
        <Login/>
      </Route>
      <Route path="/menu">
        Hello from menu!!!
      </Route>
    </Switch>
  </Router>);
}

export default App;
