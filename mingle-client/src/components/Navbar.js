import React, { Component } from "react";
import { Link } from "react-router-dom";

//Material UI related imports

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";

class Navbar extends Component {
  render() {
    return (
      <AppBar position="fixed">
        <Toolbar className="nav-container">
          <Button color="inherit" component={Link} to="/">
            {/* Here "component" is prop which is sent to the Button Component. The component used for the root node.
            Wherever you render a <Link>, an anchor (<a>) will be rendered in your HTML document.*/}
            Home
          </Button>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
          <Button color="inherit" component={Link} to="/signup">
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>
    );
  }
}

export default Navbar;
