import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import { editUserDetails } from "../redux/actions/userAction";

import { connect } from "react-redux";

import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";

const styles = {
  form: {
    textAlign: "center",
  },
  pageTitle: {
    margin: 10,
    marginBottom: 6,
  },
  textField: {
    margin: 10,
  },
  button: {
    margin: 15,
    position: "relative",
  },
  customError: {
    color: "red",
    fontSize: "0.8rem",
  },
  progress: {
    position: "absolute",
  },
};

class EditDetails extends Component {
  state = {
    bio: "",
    website: "",
    location: "",
    open: false,
  };

  componentDidUpdate() {
    const { credentials } = this.props;
    this.mapUserDetailsToState(credentials);
  }

  handleOpen = () => {
    this.setState({ open: true });
    this.mapUserDetailsToState(this.props.credentials);
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  handleSubmit = () => {
    const userDetails = {
      bio: this.state.bio,
      website: this.state.website,
      location: this.state.location,
    };
    this.props.editUserDetails(userDetails);
    this.handleClose();
  };

  mapUserDetailsToState = (credentials) => {
    this.setState({
      bio: credentials.bio ? credentials.bio : "",
      website: credentials.website ? credentials.website : "",
      location: credentials.location ? credentials.location : "",
    });
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Tooltip title="Edit Details" placement="top">
          <IconButton onClick={this.handleOpen} className={classes.Button}>
            <EditIcon color="primary" />
          </IconButton>
        </Tooltip>

        <Dialog
          open={this.state.opem}
          onCLose={this.handleClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle> Edit your details </DialogTitle>
          <DialogContent>
            <form>
              <TextField
                name="bio"
                type="text"
                label="Bio"
                multiline
                rows="3"
                placeholder="Your bio"
                className={classes.textField}
                value={this.state.bio}
                onChange={this.handleChange}
                fullWidth
              />

              <TextField
                name="website"
                type="text"
                label="Website"
                placeholder="Your website"
                className={classes.textField}
                value={this.state.website}
                onChange={this.handleChange}
                fullWidth
              />

              <TextField
                name="location"
                type="text"
                label="Location"
                placeholder="Your location"
                className={classes.textField}
                value={this.state.location}
                onChange={this.handleChange}
                fullWidth
              />
            </form>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              {" "}
              Cancel{" "}
            </Button>
            <Button onClick={this.handleSubmit} color="primary">
              {" "}
              Save{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

EditDetails.propTypes = {
  editUserDetails: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  credentials: state.user.credentials,
});

export default connect(mapStateToProps, { editUserDetails })(
  withStyles(styles)(EditDetails)
);
