const express = require("express");
const isUser = require("./middleware/isUser");
const router = express.Router();
const User = require("./models/user");
const requireLogin = require("./middleware/requireLogin");
const fs = require("fs");
const personalContent = require("./middleware/personalContent");

router.get("/:username", isUser, async (req, res) => {
    const user = await User.findOne({ username: req.params.username });

    if (user) {
        res.render("user_page", {
            user: user,
            msg: req.query.msg,
            isFriend: req.user ? user.friends.includes(req.user.username) : false,
            currentUser: req.user ? req.user.username : null,
            isPersonal: req.user ? user.username == req.user.username : false,
            sentRequest: req.user ? user.friend_requests.includes(req.user.username) : false,
        });
    } else {
        res.render("errors/404", { currentUser: req.user ? req.user.username : null });
    }
});
router.get("/:username/friends", isUser, (req, res) => {
    res.render("friends_list", {
        currentUser: req.user ? req.user : null,
        requestedUser: req.params.username,
    });
});
router.get("/:username/edit", isUser, personalContent, async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    res.render("edit_prof", {
        error: null,
        msg: null,
        user: user,
        currentUser: req.user ? req.user.username : null,
    });
});
var store = require("./multer");
router.post("/:username/edit", isUser, personalContent, store.single("profilePic"), async (req, res) => {
    try {
        if (req.file) {
            await User.updateOne(
                { username: req.user.username },
                {
                    username: req.params.username,
                    dateOfBirth: req.body.date,
                    filename: req.file.originalname,
                    contentType: req.file.mimetype,
                    imageBase64: fs.readFileSync(req.file.path).toString("base64"),
                },
                { upsert: true }
            );
        } else {
            await User.updateOne(
                { username: req.user.username },
                {
                    username: req.params.username,
                    dateOfBirth: req.body.date,
                },
                { upsert: true }
            );
        }
        res.redirect("/profile/" + req.params.username + "?msg=Profile updated successfully");
    } catch (err) {
        console.log(err);
        res.redirect("/profile/" + req.params.username + "?msg=Error while updating profile");
    }
});
router.post("/:username/add", isUser, async (req, res) => {
    let user = await User.findOne({ username: req.params.username });
    let this_user = await User.findOne({ username: req.user.username });
    if (!user.friends.includes(req.user.username) && !this_user.sent_requests.includes(user.username)) {
        user.friend_requests.push(req.user.username);
        this_user.sent_requests.push(user.username);
        await user.update({ friend_requests: user.friend_requests });
        await this_user.update({ sent_requests: this_user.sent_requests });
        res.redirect("/profile/" + req.params.username + "?msg=Friend request sent");
    } else {
        res.redirect("/");
    }
});

router.post("/:username/removeFriend", isUser, async (req, res) => {
    try {
        let this_user = await User.findOne({ username: req.params.username });
        let user = await User.findOne({ username: req.user.username });
        const selfFriends = this_user.friends.filter((user) => user != req.user.username);
        const updatedFriends = user.friends.filter((user) => user != this_user.username);
        console.log(this_user, user);

        await this_user.update({ friends: selfFriends });
        await user.update({ friends: updatedFriends });
        res.redirect("/profile/" + req.params.username + "?msg=Friend removed successfully");
    } catch {
        res.redirect("/profile/" + req.params.username + "?msg=Error while removing friend");
    }
});

router.post("/:username/unsendReq", isUser, async (req, res) => {
    let user = await User.findOne({ username: req.params.username });
    let this_user = await User.findOne({ username: req.user.username });
    const updatedReqs = user.friend_requests.filter((request) => request != req.user.username);
    const sentReq = this_user.sent_requests.filter((request) => request != user.username);
    await user.update({ friend_requests: updatedReqs });
    await this_user.update({ sent_requests: sentReq });
    res.redirect("/profile/" + req.params.username + "?msg=Friend request unsent");
});

router.post("/:username/acceptreq", isUser, async (req, res) => {
    try {
        let this_user = await User.findOne({ username: req.params.username });
        let sender = await User.findOne({ username: req.query.person });
        let newReq = this_user.friend_requests.filter((request) => request != req.query.person);
        if (req.query.type == "accept") {
            this_user.friends.push(sender.username);
            sender.friends.push(this_user.username);
        }
        let newSenderReq = sender.sent_requests.filter((request) => request != this_user.username);
        await this_user.update({ friend_requests: newReq, friends: this_user.friends });
        await sender.update({ sent_requests: newSenderReq, friends: sender.friends });
        res.redirect("/profile/" + req.params.username);
    } catch {
        res.redirect("/profile/" + req.params.username + "?msg=Error with accepting request");
    }
});

module.exports = router;
