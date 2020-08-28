const { db } = require("../utils/admin");

//get all the screams
exports.getAllScreams = (request, response) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          userHandle: doc.data().userHandle,
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userImage: doc.data().userImage,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
        });
      });
      return response.json(screams);
    })
    .catch((err) => console.error(err));
};

//write a scream
exports.postOneScream = (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: /*request.body.userHandle,*/ request.user.handle,
    userImage: request.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      const resScream = newScream;
      resScream.screamId = doc.id;
      response.json(resScream);
    })
    .catch((err) => {
      response.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

//fetch a scream
exports.getScream = (request, response) => {
  let screamData = {};
  db.doc(`/screams/${request.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        response.status(404).json({ error: "Scream not found" });
      }
      scremData = doc.data();
      scremData.screamId = doc.id;
      //along with scream fetch the comments on it too
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("screamId", "==", request.params.screamId)
        .get();
    }) //returns array of comments
    .then((data) => {
      console.log(data);
      scremData.comments = [];
      data.forEach((doc) => {
        console.log("comment:", doc.data());
        scremData.comments.push(doc.data());
      });
      return response.status(200).json(scremData);
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};

//post comment on a scream
exports.commentOnScream = (request, response) => {
  if (request.body.body.trim() === "")
    return response.status(400).json({ body: "Comment must not be empty" });

  const newComment = {
    body: request.body.body,
    createdAt: new Date().toISOString(),
    screamId: request.params.screamId,
    userHandle: request.user.handle,
    userImage: request.user.imageUrl,
  };

  //confirming if the scream exists
  db.doc(`/screams/${request.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Scream not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      response.json(newComment);
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};

//Like a scream
exports.likeScream = (request, response) => {
  // likeDocument points to a doc in likes collection where userHandle="loggedInUser" and screamId="concernedScream"
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", request.user.handle)
    .where("screamId", "==", request.params.screamId)
    .limit(1); //where returns array, hence limit it to one. Since a scream can be liked by a user only once(handled in next then), it'll always have one 1 item in array.

  const screamDocument = db.doc(`/screams/${request.params.screamId}`); //screamDocument is like query snapshot. Doing .get() gives a reference to the doc

  let screamData;

  screamDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        //Checking whether the scream exits
        screamData = doc.data();
        screamData.id = doc.id;
        return likeDocument.get();
      } else {
        return response.status(404).json({ error: "Scream does not exist" });
      }
    }) //if scream exists then likeDocument is returned. Like-only-once logic goes below
    .then((data) => {
      console.log("data.empty = ", data.empty);
      if (data.empty) {
        //if data is empty, that means user hasn't liked the scream. like the scream by creating it
        return db
          .collection("likes")
          .add({
            screamId: request.params.screamId,
            userHandle: request.user.handle,
          })
          .then(() => {
            screamData.likeCount++;
            return screamDocument.update({ likeCount: screamData.likeCount });
          })
          .then(() => {
            return response.json(screamData);
          });
      } else {
        //already liked by user
        return response
          .status(400)
          .json({ error: "Scream already liked by user" });
      }
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: "Something went wrong" });
    });
};

exports.unLikeScream = (request, response) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", request.user.handle)
    .where("screamId", "==", request.params.screamId)
    .limit(1);

  const screamDocument = db.doc(`/screams/${request.params.screamId}`); //screamDocument is like query snapshot. Doing .get() gives a reference to the doc

  let screamData;

  screamDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        //Checking whether the scream exits
        screamData = doc.data();
        screamData.id = doc.id;
        return likeDocument.get();
      } else {
        return response.status(404).json({ error: "Scream does not exist" });
      }
    }) //if scream exists then likeDocument is returned. Like-only-once logic goes below
    .then((data) => {
      if (data.empty) {
        //if data is empty, that means user hasn't liked the scream. leave it as is
        return response.status(400).json({ error: "Scream not liked" });
      } else {
        // liked by user. Unlike it by removing that doc from likes collection
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            screamData.likeCount--;
            return screamDocument.update({ likeCount: screamData.likeCount });
          })
          .then(() => {
            response.json(screamData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: "Something went wrong" });
    });
};

exports.deleteScream = (request, response) => {
  const document = db.doc(`/screams/${request.params.screamId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Scream not found" });
      }
      if (doc.data().userHandle !== request.user.handle) {
        return response
          .status(403)
          .json({ error: "You do not have permission to delete this scream" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      response.json({ error: "scream deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};
