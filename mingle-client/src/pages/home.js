import React, { Component } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";

import Scream from "../components/Scream";
import Profile from "../components/Profile";

class home extends Component {
  state = {
    screams: null,
  };

  componentDidMount() {
    axios
      .get("/screams")
      .then((result) => {
        console.log(result.data);
        this.setState({
          screams: result.data,
        });
      })
      .catch((err) => console.error(err));
  }

  render() {
    let recentScreamMarkUp = this.state.screams ? (
      this.state.screams.map((scream) => (
        <Scream key={scream.screamId} scream={scream} />
      ))
    ) : (
      <p>Loading...</p>
    );

    return (
      <Grid container spacing={2}>
        <Grid item sm={8} xs={12}>
          {recentScreamMarkUp}
        </Grid>
        <Grid item sm={4} xs={12}>
          <Profile />
        </Grid>
      </Grid>
    );
  }
}

export default home;
