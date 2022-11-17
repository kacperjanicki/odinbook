const express = require("express");
const isUser = require("./middleware/isUser");
const router = express.Router();
router.use(express.json());
const User = require("./models/user");
const Post = require("./models/post");
const fs = require("fs");
const requireLogin = require("./middleware/requireLogin");
const personalContent = require("./middleware/personalContent");

router.get("/:username", isUser, async (req, res) => {
    const URLuser = await User.findOne({ username: req.params.username })
        .populate("friend_requests")
        .populate("friends");
    let userPosts = await Post.find({ author: URLuser._id }).populate("comments").populate("author");
    isPostLiked(userPosts, req.currentUser);

    if (URLuser) {
        res.render("user_page", {
            currentUser: req.currentUser,
            posts: userPosts,
            user: URLuser,
            this_user: false,
            msg: req.query.msg,
            alert: req.query.alert,
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
router.get("/:username/edit", isUser, personalContent, (req, res) => {
    res.render("edit_prof", {
        error: null,
        msg: null,
        alert: req.query.alert,
        currentUser: req.currentUser,
    });
});
var multer = require("multer");
const isPostLiked = require("./public/postLiked");
router.post("/:username/edit", isUser, personalContent, async (req, res) => {
    var storage = multer.diskStorage({
        destination: function (request, file, callback) {
            callback(null, "./uploads");
        },
        filename: function (request, file, callback) {
            var temp_file_arr = file.originalname.split(".");

            var temp_file_name = temp_file_arr[0];

            var temp_file_extension = temp_file_arr[1];

            callback(null, temp_file_name + "-" + Date.now() + "." + temp_file_extension);
        },
    });
    var upload = multer({ storage: storage }).single("profilePic");
    const saveProfilePic = (user, req) => {
        if (!req.file) return;
        user.filename = req.file.originalname;
        user.contentType = req.file.mimetype;
        user.imageBase64 = fs.readFileSync(req.file.path).toString("base64");
    };
    upload(req, res, async (err) => {
        try {
            const user = await User.findOne({ username: req.currentUser.username });
            user.fname = req.body.fname;
            user.lname = req.body.lname;
            user.dateOfBirth = req.body.date;
            saveProfilePic(user, req);
            await user.save();
        } catch (err) {
            console.error(err);
        }
        if (err) {
            return res.end("error");
        } else {
            return res.redirect(`/profile/${req.currentUser.username}/?alert=Profile updated successfully`);
        }
    });

    // if (binary) {
    //     user.imageBase64 = binary;
    //     await user.save((err) => {
    //         err ? console.log(err) : res.redirect("/profile");
    //     });
    // }

    // saveProfilePic(user, req.body.profilePic);
    // user.username = req.params.username;
    // user.lname = req.body.lname;
    // user.fname = req.body.fname;
    // user.dateOfBirth = req.body.date;

    // try {
    // await user.save()
    // res.redirect("/profile/" + updatedUser.username);
    // } catch (err) {
    // console.error(err);
    // res.redirect("/");
    // }
});
const saveProfilePic = async (user, file) => {
    if (!file) return;
    const fs = require("fs").promises;
    const contents = await fs.readFile(file, { encoding: "base64" });
    // user.filename = file.originalname;
    // user.contentType = file.mimetype;
    // user.imageBase64 = fs.readFileSync(file.path).toString("base64");
};

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

            let backUrl = req.header("Referer");
            if (backUrl.split("?").length > 1) {
                backUrl = backUrl.split("?")[0];
            }
            res.redirect(backUrl + "?alert=Friend request sent");
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
        let backUrl = req.header("Referer");
        if (backUrl.split("?").length > 1) {
            backUrl = backUrl.split("?")[0];
        }
        res.redirect(backUrl + `?alert=You and ${friendDel.fname} ${friendDel.lname} are no longer friends.`);
    } catch (err) {
        res.redirect("/");
        console.log(err);
    }
});

router.post("/:username/unsendReq", isUser, async (req, res) => {
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
    let backUrl = req.header("Referer");
    if (backUrl.split("?").length > 1) {
        backUrl = backUrl.split("?")[0];
    }
    res.redirect(backUrl + "?alert=Friend request unsent");
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
        if (req.query.type == "accept") {
            res.redirect(
                req.header("Referer") + `?alert=You and ${sender.fname} ${sender.lname} are now friends.`
            );
        } else {
            res.redirect("back");
        }
    } catch (err) {
        console.error(err);
        res.redirect("/profile/" + req.params.username + "?msg=Error with accepting request");
    }
});
router.get("/:username/delete", isUser, personalContent, async (req, res) => {
    res.render("delete", {
        alert: req.params.alert,
        currentUser: req.currentUser,
    });
});

router.post("/:username/delete", isUser, personalContent, async (req, res) => {
    let user = await User.findOne({ username: req.currentUser.username });
    let posts = await Post.find({}).populate("comments");

    posts.forEach((post) => {
        let like = post.likes.filter((like) => like.equals(user._id));
        //remove all likes from this user
        like.forEach(async (entity) => {
            let filteredLikes = post.likes.filter((postlike) => !postlike.equals(entity));
            await Post.updateOne({ _id: post._id }, { likes: filteredLikes });
        });
        //remove all comments from this user
        let comments = post.comments.filter((com) => com.author.equals(user._id));
        console.log("1  " + comments);
        comments.forEach(async (entity) => {
            let filteredComments = post.comments.filter((comment) => !comment.equals(entity));
            console.log("2 " + filteredComments);
            await Post.updateOne({ _id: post._id }, { comments: filteredComments });
        });
    });
    let all_users = await User.find({});
    all_users.forEach(async (person) => {
        let filteredFriends = person.friends.filter((friend) => !friend._id.equals(user._id));
        await User.updateOne({ username: person.username }, { friends: filteredFriends });
    });

    // user.posts.forEach(async (post) => {
    //     await Post.deleteOne({ _id: post._id });
    // });

    // res.clearCookie("token");

    res.redirect("/");
});

module.exports = router;
