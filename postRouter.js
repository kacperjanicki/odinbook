const express = require("express");
const isUser = require("./middleware/isUser");
const router = express.Router();
const Post = require("./models/post");
const methodOverride = require("method-override");
router.use(methodOverride("_method"));
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to mongoose"));

router.get("/", isUser, async (req, res) => {
    var posts = await Post.find({});
    console.log(String(posts[0]._id));
    res.render("all_posts", {
        isUser: req.user ? true : false,
        posts: posts,
        currentUser: req.user ? req.user.username : null,
    });
});

router.get("/new", isUser, (req, res) => {
    if (req.user) {
        res.render("new_post", { isUser: req.user ? true : false, post: false });
    } else {
        return res.json(400, { msg: "Access denied" });
    }
});
router.post("/new", isUser, (req, res) => {
    console.log(req.user);
    if (req.user) {
        var post = new Post({
            body: req.body.body,
            author: req.user.username,
            createdAt: Date.now(),
            public: req.body.public == "on",
        });
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
        posts: [post],
        isUser: req.user ? true : false,
        currentUser: req.user ? req.user.username : null,
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
            isUser: req.user ? true : false,
            post: post,
        });
    } else {
        res.json(400, { msg: "access denied" });
    }
});

router.post("/:id/edit", isUser, async (req, res) => {
    var post = await Post.findById(req.params.id);
    if (post.author == req.user.username) {
        console.log(req.body);
        await Post.findByIdAndUpdate(String(post._id), {
            public: req.body.public == "on",
            body: req.body.body,
        });
        res.redirect("/posts");
    } else {
        res.json(400, { msg: "access denied" });
    }
});

module.exports = router;
