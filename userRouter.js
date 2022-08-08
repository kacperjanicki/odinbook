const express = require("express");
const isUser = require("./middleware/isUser");
const router = express.Router();
const User = require("./models/user");
const requireLogin = require("./middleware/requireLogin");
const personalContent = require("./middleware/personalContent");

router.get("/:username", isUser, async (req, res) => {
    const user = await User.find({ username: req.params.username });
    let isPersonal = user[0].username == req.user.username;
    if (user.length != 0) {
        res.render("user_page", {
            user: user[0],
            currentUser: req.user ? req.user.username : null,
            isPersonal: isPersonal,
        });
    } else {
        res.render("404", { currentUser: req.user ? req.user : null });
    }
});
router.get("/:username/friends", isUser, (req, res) => {
    res.render("friends_list", {
        currentUser: req.user ? req.user : null,
        requestedUser: req.params.username,
    });
});
router.get("/:username/edit", isUser, personalContent, async (req, res) => {
    console.log(req.user);
    const user = await User.findOne({ username: req.params.username });
    res.render("edit_prof", {
        error: null,
        msg: null,
        user: user,
        currentUser: req.user ? req.user : null,
    });
});
router.post("/:username/edit", isUser, personalContent, async (req, res) => {
    await User.updateOne(
        {
            username: req.params.username,
        },
        {
            dateOfBirth: req.body.date,
        },
        { upsert: true }
    );
    res.redirect("/profile/" + req.params.username);
});

module.exports = router;
