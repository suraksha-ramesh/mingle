const functions = require("firebase-functions");

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unLikeScream,
  deleteScream,
} = require("./handlers/screams");

const {
  signUp,
  logIn,
  upLoadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
} = require("./handlers/users");

const express = require("express");
const app = express();

const { fireBaseAuth } = require("./utils/fbAuth");

//scream routes
//get the screams in desc order
app.get("/screams", getAllScreams);

//post one scream
//2nd argument is the begining of middleware, any number of middlewares can be chained.
//It will be called in the order that is specified
//Create stream
app.post("/scream", fireBaseAuth, postOneScream);

//singup route (users route)
app.post("/signup", signUp);

//login route (users route)
app.post("/login", logIn);

//user image upload
app.post("/user/image", fireBaseAuth, upLoadImage);

//add extra details to users
app.post("/user", fireBaseAuth, addUserDetails);

//get authenticated user
app.get("/user", fireBaseAuth, getAuthenticatedUser);

//get one scream
app.get("/scream/:screamId", getScream); //colon indicates that it is a route parameter

//write a comment
app.post("/scream/:screamId/comment", fireBaseAuth, commentOnScream);

//like a scream
app.get("/scream/:screamId/like", fireBaseAuth, likeScream);

//Unlike a scream
app.get("/scream/:screamId/unlike", fireBaseAuth, unLikeScream);

//delete a scream
app.delete("/scream/:screamId", fireBaseAuth, deleteScream);

//get any user detail
app.get("/user/:handle", getUserDetails);

exports.api = functions.https.onRequest(app);
