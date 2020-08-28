let db = {
  users: [
    {
      userId: "jhvhkfwbguu6545ajhhj",
      createdAt: "2020-06-08T06:47:39.122Z",
      email: "user@email.com",
      handle: "user",
      imageUrl: "image/myphoto.png",
      bio: "whatever",
      website: "https://whatever.com",
      location: "Karnataka, Bangalore",
    },
  ],

  screams: [
    {
      body: "scream whaever",
      createdAt: "2020-06-07T18:30:42.842Z",
      userHandle: "user",
      likeCount: 3,
      commentCount: 2,
    },
  ],

  comments: [
    {
      userHandle: "user",
      screamId: "bhbvbiybybvyiukjkuhi",
      createdAt: "2020-06-07T18:30:42.842Z",
      body: "whatever",
    },
  ],
};

const userDetails = {
  credentials: {
    userId: "jhvhkfwbguu6545ajhhj",
    createdAt: "2020-06-08T06:47:39.122Z",
    email: "user@email.com",
    handle: "user",
    imageUrl: "image/myphoto.png",
    bio: "whatever",
    website: "https://whatever.com",
    location: "Karnataka, Bangalore",
  },
  likes: [
    {
      userHandle: "user",
      screamId: "khbvhBwfiugwfiubjh",
    },
    {
      userHandle: "chetu",
      screamId: "fvbaaiygabeiugbetu",
    },
  ],
};
