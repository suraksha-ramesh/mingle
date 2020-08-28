const admin = require("firebase-admin");

var serviceAccount = require("../mingle-c1a13ee6f9c2.json");

//Before doing anything with admin, initialize it
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mingle-6aa8d.firebaseio.com",
});
const db = admin.firestore();

module.exports = { admin, db };
