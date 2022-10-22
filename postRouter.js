const express = require("express");
const isUser = require("./middleware/isUser");
const router = express.Router();
const Post = require("./models/post");
const User = require("./models/user");
const methodOverride = require("method-override");
router.use(methodOverride("_method"));
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to mongoose"));

router.get("/", isUser, async (req, res) => {
    var posts = await Post.find({}).populate("author");
    // posts.forEach((post) => {
    //     console.log(post);
    //     post;
    // });

    res.render("all_posts", {
        posts: posts,
        user: req.user ? await User.findOne({ username: req.params.username }) : null,
        currentUser: req.user ? req.user.username : null,
        msg: null,
    });
});

router.get("/new", isUser, (req, res) => {
    if (req.user) {
        res.render("new_post", {
            post: false,
            currentUser: req.user ? req.user.username : null,
        });
    } else {
        return res.json(400, { msg: "Access denied" });
    }
});
router.post("/new", isUser, async (req, res) => {
    const author = await User.findOne({ username: req.user.username });
    if (req.user) {
        var post = new Post({
            body: req.body.body,
            author: author._id,
            createdAt: Date.now(),
            public: req.body.public == "on",
        });
        author.posts.push(post);
        await author.save();
        console.log(req.body);
        try {
            post.save();
            res.redirect("/posts");
        } catch (err) {
            console.error(err);
        }
    } else {
        res.json(400, { msg: "Access denied" });
    }
});
router.get("/:id", isUser, async (req, res) => {
    var o_id = new ObjectId(req.params.id);
    var post = await Post.findById(o_id);
    res.render("all_posts", {
        currentUser: req.user ? req.user.username : null,
        msg: req.query.msg,
        posts: [post],
    });
});
router.delete("/:id", isUser, async (req, res) => {
    var o_id = new ObjectId(req.params.id);
    var post = await Post.findById(o_id);
    if (req.user && req.user.username == post.author) {
        var o_id = new ObjectId(req.params.id);
        await post.remove();
        res.redirect("/");
    } else {
        res.json(400, { msg: "access denied" });
    }
});

router.post("/:id", isUser, async (req, res) => {
    var post = await Post.findById(req.params.id);
    if (req.user && req.user.username == post.author) {
        await Post.findByIdAndUpdate(req.params.id, { public: req.query.public });
        res.redirect("/");
    } else {
        res.json(400, { msg: "access denied" });
    }
});
router.get("/:id/edit", isUser, async (req, res) => {
    var post = await Post.findById(req.params.id);
    if (req.user && req.user.username == post.author) {
        res.render("new_post", {
            currentUser: req.user ? req.user.username : null,
            post: post,
        });
    } else {
        res.json(400, { msg: "access denied" });
    }
});

router.post("/:id/edit", isUser, async (req, res) => {
    var post = await Post.findById(req.params.id);
    if (post.author == req.user.username) {
        await Post.findByIdAndUpdate(String(post._id), {
            public: req.body.public == "on",
            body: req.body.body,
        });
        res.redirect("/posts");
    } else {
        res.json(400, { msg: "access denied" });
    }
});
router.post("/:id/like", isUser, async (req, res) => {
    let post = await Post.findById(req.params.id);
    post.likes.push(req.user.username);
    await post.update({ likes: post.likes });
    res.redirect("back");
});
router.post("/:id/dislike", isUser, async (req, res, next) => {
    let post = await Post.findById(req.params.id);
    let newLikes = post.likes.filter((like) => like != req.user.username);
    await post.update({ likes: newLikes });
    console.log(res.redirect("back"));
});

router.post("/:id/comment", isUser, async (req, res) => {
    console.log(req.body.body);
    try {
        if (req.body.body.length > 1) {
            let post = await Post.findById(req.params.id);
            post.comments.push({ body: req.body.body, author: req.user.username, added: Date.now() });
            await post.update({ comments: post.comments });
            res.redirect("back");
        } else {
            return res.redirect("/posts/" + req.params.id + "?msg=Can't send empty comment");
        }
    } catch (err) {
        res.redirect("/posts/" + req.params.id + "?msg=Error with adding comment");
        console.error(err);
    }
});

module.exports = router;
