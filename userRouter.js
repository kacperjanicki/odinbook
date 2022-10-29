const express = require("express");
const isUser = require("./middleware/isUser");
const router = express.Router();
const User = require("./models/user");
const requireLogin = require("./middleware/requireLogin");
const fs = require("fs");
const personalContent = require("./middleware/personalContent");

router.get("/:username", isUser, async (req, res) => {
    const URLuser = await User.findOne({ username: req.params.username })
        .populate("friend_requests")
        .populate("friends");

    if (URLuser) {
        // let sentReq =
        // URLuser.sent_requests.filter((request) => request._id.equals(req.currentUser._id)).length > 0;
        res.render("user_page", {
            currentUser: req.currentUser,
            user: URLuser,
            msg: req.query.msg,
            like: false,
            isFriend: req.currentUser
                ? URLuser.friends.filter((friend) => friend._id.equals(req.currentUser._id)).length > 0
                : false,
            isPersonal: req.currentUser ? URLuser.username == req.currentUser.username : false,
            awaitingRequest: req.currentUser
                ? req.currentUser.friend_requests.filter((request) => request.equals(URLuser._id))[0]
                : false,
            sentRequest: req.currentUser
                ? req.currentUser.sent_requests.filter((request) => request.equals(URLuser._id)).length > 0
                : false,
        });
    } else {
        res.render("errors/404", { currentUser: req.currentUser });
    }
});
router.get("/:username/friends", isUser, async (req, res) => {
    res.render("friends_list", {
        currentUser: req.currentUser ? await User.findOne({ username: req.currentUser.username }) : null,
        requestedUser: req.params.username,
    });
});
router.get("/:username/edit", isUser, personalContent, async (req, res) => {
    res.render("edit_prof", {
        error: null,
        msg: null,
        currentUser: req.currentUser,
    });
});
var store = require("./multer");
router.post("/:username/edit", store.single("profilePic"), isUser, personalContent, async (req, res) => {
    try {
        if (req.file) {
            await User.updateOne(
                { username: req.currentUser.username },
                {
                    username: req.params.username,
                    dateOfBirth: req.body.date,
                    filename: req.file.originalname,
                    contentType: req.file.mimetype,
                    imageBase64: fs.readFileSync(req.file.path).toString("base64"),
                },
                { upsert: true }
            );
            res.redirect("/profile/" + req.currentUser.username + "?msg=Profile updated successfully");
        } else {
            await User.updateOne(
                { username: req.currentUser.username },
                {
                    username: req.params.username,
                    dateOfBirth: req.body.date,
                },
                { upsert: true }
            );
            res.redirect("/profile/" + req.currentUser.username + "?msg=Profile updated successfully");
        }
    } catch (err) {
        console.log(err);
        res.redirect("/profile/" + req.params.username + "?msg=Error while updating profile");
    }
});
router.post("/:username/add", isUser, requireLogin, async (req, res) => {
    let user = await User.findOne({ username: req.params.username });
    let this_user = await User.findOne({ username: req.currentUser.username });
    if (user.username == this_user.username) {
        //prevent sending request to yourself
        res.redirect(req.header("Referer") + "?msg=Can't send request to yourself");
    } else {
        if (!user.friends.includes(this_user._id) && !this_user.sent_requests.includes(user._id)) {
            user.friend_requests.push(this_user._id);
            this_user.sent_requests.push(user._id);
            await User.updateOne(
                { username: user.username },
                { friend_requests: user.friend_requests }
            ).populate("friend_requests");
            await User.updateOne(
                { username: this_user.username },
                { sent_requests: this_user.sent_requests }
            ).populate("sent_requests");
            res.redirect("/profile/" + req.params.username + "?msg=Friend request sent");
        } else {
            res.redirect("/");
        }
    }
});

router.post("/:username/removeFriend", isUser, async (req, res) => {
    let friendDel = await User.findOne({
        username: req.query.friend,
    }).populate("friends");
    let currentUser = await User.findOne({ username: req.currentUser.username }).populate("friends");

    try {
        let myFilteredFriends = currentUser.friends.filter((friend) => !friend._id.equals(friendDel._id));

        let userFilteredFriends = friendDel.friends.filter((friend) => !friend._id.equals(currentUser._id));

        await User.updateOne({ username: currentUser.username }, { friends: myFilteredFriends }); //change current user friends list
        await User.updateOne({ username: friendDel.username }, { friends: userFilteredFriends }); //change friend friend's list
        res.redirect("/profile/" + currentUser.username + "?msg=Friend removed successfully");
    } catch (err) {
        res.redirect("/");
        console.log(err);
    }
});

router.post("/:username/unsendReq", isUser, async (req, res) => {
    console.log("test");
    let user = await User.findOne({ username: req.params.username });
    let this_user = await User.findOne({ username: req.currentUser.username });
    const updatedReqs = user.friend_requests.filter(
        (request) => request.toHexString() != this_user._id.toHexString()
    );
    const sentReq = this_user.sent_requests.filter(
        (request) => request.toHexString() != user._id.toHexString()
    );
    await User.updateOne({ username: user.username }, { friend_requests: updatedReqs }, { upsert: true });
    await User.updateOne({ username: this_user.username }, { sent_requests: sentReq }, { upsert: true });
    res.redirect("/profile/" + user.username + "?msg=Friend request unsent");
});

router.post("/:username/acceptreq", isUser, personalContent, async (req, res) => {
    try {
        let this_user = req.currentUser;
        let sender = await User.findOne({ username: req.query.person });
        let newReq = this_user.friend_requests.filter(
            (request) => request._id.toHexString() != sender._id.toHexString()
        );
        let newSenderReq = sender.sent_requests.filter(
            (request) => request._id.toHexString() != this_user._id.toHexString()
        );

        if (req.query.type == "accept") {
            this_user.friends.push(sender._id);
            sender.friends.push(this_user._id);
        }

        await User.updateOne(
            { username: this_user.username },
            { friend_requests: newReq, friends: this_user.friends }
        );
        await User.updateOne(
            { username: sender.username },
            { sent_requests: newSenderReq, friends: sender.friends }
        );
        res.redirect("/profile/" + req.params.username);
    } catch (err) {
        console.error(err);
        res.redirect("/profile/" + req.params.username + "?msg=Error with accepting request");
    }
});
router.get("/:username/delete", isUser, personalContent, async (req, res) => {
    res.render("delete", {
        currentUser: req.currentUser ? await User.findOne({ username: req.currentUser.username }) : null,
    });
});
router.post("/:username/delete", isUser, personalContent, async (req, res) => {
    let user = await User.find({ username: req.currentUser.username });
});

module.exports = router;
