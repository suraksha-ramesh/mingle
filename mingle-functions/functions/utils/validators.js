const isEmpty = (string1) => {
  if (string1 === "") return true;
  else return false;
};

exports.reduceUserDetails = (data) => {
  //data is request.body
  let userDetails = {};

  if (!isEmpty(data.bio)) userDetails.bio = data.bio;

  if (!isEmpty(data.website)) {
    if (data.website.substring(0, 4) !== "http") {
      userDetails.website = `http://${data.website}`;
    } else userDetails.website = data.website;
  }

  if (!isEmpty(data.location)) userDetails.location = data.location;

  return userDetails;
};
