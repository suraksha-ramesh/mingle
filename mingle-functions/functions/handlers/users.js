const { db, admin } = require("../utils/admin");

const config = require("../utils/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const { reduceUserDetails } = require("../utils/validators");

const isEmpty = (string1) => {
  if (string1 === "") return true;
  else return false;
};

const isEmail = (email) => {
  // Regular expression for valid email
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

//Sign up call back
exports.signUp = (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle,
  };

  let errors = {};

  //Validating the user credentials

  if (isEmpty(newUser.email)) errors.email = "Must not be empty";
  else if (!isEmail(newUser.email)) errors.email = "Not a valid email";

  if (isEmpty(newUser.password)) errors.password = "Must not be empty";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Password dont match";
  if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";

  if (Object.keys(errors).length > 0) return response.status(400).json(errors);

  //whenever user signs up, give them that default image 'no-img.png'stored in firebase storage
  const noImg = "no-img.png";

  let token, userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        //though document does not exist, an empty snapshot is returned
        return response
          .status(400)
          .json({ handle: "This handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    }) // Around 1 hour
    .then((idToken) => {
      token = idToken;
      const userCredential = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredential);
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch((error) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "email is already in use" });
      } else return response.status(500).json({ error: err.code });
    });
};

//login call back
exports.logIn = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  let errors = {};

  if (isEmpty(user.email)) errors.email = "Must not be empty";
  if (isEmpty(user.password)) errors.password = "Must not be empty";

  if (Object.keys(errors).length > 0) return response.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token1) => {
      return response.json({ token1 });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        response
          .status(403)
          .json({ error: "Wrong credentials, Please try again" });
      } else return response.status(500).json({ error: err.code });
    });
};

//upload image callback
exports.upLoadImage = (request, response) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs"); //file system

  let imageFileName;
  let imageToBeUploaded = {};

  //instantiating an instance of BusBoy
  const busboy = new BusBoy({ headers: request.headers });
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png")
      return response.status(400).json({ error: "Wrong file type submitted" });
    console.log(
      "fieldname ",
      fieldname,
      " file ",
      filename,
      " mimetype ",
      mimetype
    );

    //extract the extension of the image file ex: png, jpg etc
    const imageExtension = filename.split(".")[filename.split(".").length - 1]; //getting the last value in the array cuz filename can be my.photo.jpg
    imageFileName = `${Math.round(
      Math.random() * 10000000000
    )}.${imageExtension}`; //184825156574.png

    console.log("imageFileName is:", imageFileName);

    const filePath = path.join(os.tmpdir(), imageFileName);

    imageToBeUploaded = { filePath, mimetype };
    file.pipe(fs.createWriteStream(filePath));
  });

  busboy.on("finish", () => {
    console.log("finish section of busboy");
    admin
      .storage()
      .bucket(config.storageBucket)
      .upload(imageToBeUploaded.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      }) //upload returns a promise
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`; //alt is to display image in browser, otherwise, image gets downloaded

        console.log(imageUrl);
        //adding user's image to respective doc in users collection
        //since fireBaseAuth middleare is called prior to this method, we have access to request.user.handle
        return db
          .doc(`/users/${request.user.handle}`)
          .update({ imageUrl: imageUrl }); //update takes object in the form {field:value}
      }) //update returns a promise
      .then(() => {
        return response.json({ message: "Image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({ error: err.code });
      });
  });

  busboy.end(request.rawBody);
};

//add user details callback
exports.addUserDetails = (request, response) => {
  let userDetails = reduceUserDetails(request.body);

  db.doc(`/users/${request.user.handle}`)
    .update(userDetails)
    .then(() => {
      return response
        .status(200)
        .json({ message: "User details updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};

//get own user details
exports.getAuthenticatedUser = (request, response) => {
  let userData = {}; //user data is gonna have fields credentials and likes
  db.doc(`/users/${request.user.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data(); //credentials hold doc of users collection
        return db
          .collection("likes")
          .where("userHandle", "==", request.user.handle)
          .get(); // likes is an array. Array of all screams liked by user
      }
    }) //returned data is array of likes which has to be put into userData.likes
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data()); //doc is like refernce to the doc. To get the data in doc, do .data()
      });
      return response.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

//get any user details
exports.getUserDetails = (request, response) => {
  let userData = {};
  db.doc(`/users/${request.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data(); //user details
        return db
          .collection("screams")
          .where("userHandle", "==", request.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return response.status(404).json({ error: "user not found" });
      }
    })
    .then((data) => {
      userData.screams = [];
      data.forEach((doc) => {
        userData.screams.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().body,
          userHandle: doc.data().userHandle,
          UserImage: doc.data().body,
          screamId: doc.id,
        });
      });
      return response.json(userData);
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};
