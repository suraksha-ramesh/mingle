const { db, admin } = require("./admin");

//  Middleware authentication
exports.fireBaseAuth = (request, response, next) => {
  let idToken;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer ")
  ) {
    //authorization header will be something like, "Authorization = Bearer <token>", hence splitting it and taking the 1st index value

    idToken = request.headers.authorization.split("Bearer ")[1];
    console.log(idToken); //logging the token sent via header in request
  } else {
    console.error("No token found");
    return response.status(403).json({
      error: "Authorization header is not present/ does not begin with bearer",
    });
  }

  //Just the existence of token is not sufficient to authorize, we need to verify if it was issued by our application only or not
  //Adding the user handle to request
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      request.user = decodedToken;
      console.log("decoded token is", decodedToken);
      return db
        .collection("users")
        .where("userId", "==", request.user.uid) //where returns an array, get the first one
        .limit(1)
        .get();
    })
    .then((data) => {
      console.log("data is", data);
      console.log("data.doc[0] is", data.docs[0]);
      request.user.handle = data.docs[0].data().handle; //adding handle to request
      request.user.imageUrl = data.docs[0].data().imageUrl;
      return next(); //calling next to go back to next callback method in the api call
    })
    .catch((err) => {
      console.error("error while verifying tokem", err);
      return response.status(403).json(err);
    });
};
