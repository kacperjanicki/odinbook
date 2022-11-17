const express = require("express");
const isUser = require("./middleware/isUser");
const User = require("./models/user");
const router = express.Router();

router.get("/", isUser, async (req, res) => {
    let users = await User.find({}).populate("friends");
    users.forEach((user) => {
        user.isPersonal = false;
        user.awaitingReq = false;
        user.isFriend = false;
        user.sentReq = false;
        user.mutual = 0;
        if (req.currentUser) {
            if (user.username == req.currentUser.username) {
                user.isPersonal = true;
            }
            if (user.sent_requests.filter((request) => request.equals(req.currentUser._id)).length > 0) {
                user.awaitingReq = user.username;
            }
            if (req.currentUser.sent_requests.filter((request) => request.equals(user._id)).length > 0) {
                user.sentReq = true;
            }
            if (user.friends.filter((person) => person.equals(req.currentUser._id)).length > 0) {
                user.isFriend = user.friends.filter((person) =>
                    person.equals(req.currentUser._id)
                )[0].username;
            }
            // prettier-ignore
            user.mutual = []
            user.friends.forEach((friend) => {
                let myfriends = req.currentUser.friends;
                if (myfriends.filter((my_friend) => my_friend.equals(friend)).length > 0) {
                    console.log(user.username, friend.username);
                    user.mutual.push(friend);
                }
            });
            user.mutual = user.mutual;
        }
    });

    res.render("all_users", {
        currentUser: req.currentUser,
        users: users,
        msg: null,
        alert: req.query.alert,
        like: false,
    });
});

module.exports = router;
