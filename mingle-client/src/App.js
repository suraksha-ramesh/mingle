import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import axios from "axios";

//redux
import { Provider } from "react-redux";
import store from "./redux/store";
import { SET_AUTHENTICATED } from "./redux/type";
import { logoutUser, getUserData } from "./redux/actions/userAction";
//MUI
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import CreateMuiTheme from "@material-ui/core/styles/createMuiTheme";
import jwtDecode from "jwt-decode";

// importing pages
import home from "./pages/home";
import login from "./pages/login";
import signup from "./pages/signup";

import Navbar from "./components/Navbar";
import AuthRoute from "./utils/AuthRoute";

const theme = CreateMuiTheme({
  palette: {
    primary: {
      main: "#ffab91",
      contrastText: "#333333",
    },
    secondary: {
      main: "#ff5722",
      contrastText: "#333333",
    },
  },
});

const token = localStorage.FBIdToken;
if (token) {
  const decodedToken = jwtDecode(token);
  console.log(decodedToken);
  if (decodedToken.exp * 1000 < Date.now()) {
    //exp is the expiration time in ms
    window.location.href = "/login";
    store.dispatch(logoutUser());
  } else {
    // window.location.href = "/";
    store.dispatch({ type: SET_AUTHENTICATED });
    axios.defaults.headers.common["Authorization"] = token;
    store.dispatch(getUserData());
  }
}

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        {/* To use a router, just make sure it is rendered at the root of your element hierarchy. 
      Typically you’ll wrap your top-level element in a router*/}

        <Router>
          <Navbar />
          <div className="container">
            <Switch>
              <Route exact path="/" component={home} />
              {/* Here "component" is a prop that indicates which page to render for the specified path */}
              <AuthRoute exact path="/login" component={login} />
              <AuthRoute exact path="/signup" component={signup} />
            </Switch>
          </div>
        </Router>
      </Provider>
    </MuiThemeProvider>
  );
}

export default App;
