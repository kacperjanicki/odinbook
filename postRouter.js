const express = require("express");
const isUser = require("./middleware/isUser");
const router = express.Router();
const Post = require("./models/post");
const User = require("./models/user");
const methodOverride = require("method-override");
router.use(methodOverride("_method"));
const ObjectId = require("mongodb").ObjectId;
const isPostLiked = require("./public/postLiked");
const requireLogin = require("./middleware/requireLogin");

router.get("/", isUser, async (req, res) => {
    var posts = await Post.find({}).populate("author").populate("comments");
    isPostLiked(posts, req.currentUser);

    res.render("all_posts", {
        posts: posts,
        currentUser: req.currentUser,
        alert: req.query.alert,
        singlePost: false,
        msg: req.params.msg,
    });
});

router.get("/new", isUser, requireLogin, (req, res) => {
    res.redirect("/");
});
router.post("/new", isUser, async (req, res) => {
    const author = await User.findOne({ username: req.currentUser.username });
    if (req.currentUser && req.body.body.length >= 1) {
        var post = new Post({
            body: req.body.body,
            author: author._id,
            createdAt: Date.now(),
            privacy: req.body.public == "on" ? "public" : req.body.friends == "on" ? "friends" : "private",
            likes: [],
            comments: [],
        });
        author.posts.push(post);
        await author.save();
        try {
            post.save();
            res.redirect("/posts");
        } catch (err) {
            console.error(err);
        }
    } else if (req.body.body.length < 1) {
        res.redirect("/?msg=You can't send empty post");
    } else {
        res.json(400, { msg: "Access denied" });
    }
});
router.get("/:id", isUser, async (req, res) => {
    var post = await Post.findOne({ _id: new ObjectId(req.params.id) })
        .populate("author")
        .populate("comments");
    isPostLiked([post], req.currentUser);
    console.log(req.query.alert);
    res.render("all_posts", {
        singlePost: true,
        alert: req.query.alert,
        currentUser: req.currentUser,
        msg: req.query.alert,
        posts: [post],
    });
});
router.delete("/:id", isUser, async (req, res) => {
    var o_id = new ObjectId(req.params.id);
    var post = await Post.findById(o_id);
    if (req.currentUser && req.currentUser == post.author) {
        var o_id = new ObjectId(req.params.id);
        await post.remove();
        res.redirect("/");
    } else {
        res.json(400, { msg: "access denied" });
    }
});

router.post("/:id", isUser, async (req, res) => {
    var post = await Post.findById(req.params.id);
    if (req.currentUser && req.currentUser == post.author) {
        await Post.findByIdAndUpdate(req.params.id, { public: req.query.public });
        res.redirect("/");
    } else {
        res.json(400, { msg: "access denied" });
    }
});
router.get("/:id/edit", isUser, async (req, res) => {
    var post = await Post.findById(req.params.id);
    if (req.currentUser && req.currentUser == post.author) {
        res.render("new_post", {
            currentUser: req.currentUser ? req.currentUser : null,
            post: post,
        });
    } else {
        res.json(400, { msg: "access denied" });
    }
});

router.post("/:id/edit", isUser, async (req, res) => {
    var post = await Post.findById(req.params.id);
    if (post.author == req.currentUser) {
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
    if (req.currentUser) {
        let post = await Post.findById(req.params.id);
        post.likes.push(req.currentUser._id);
        await Post.updateOne({ _id: post._id }, { likes: post.likes });

        let backUrl = req.header("Referer");
        if (backUrl.split("?").length > 1) {
            backUrl = backUrl.split("?")[0];
        }
        res.redirect(backUrl + "?alert=Post liked");
    } else {
        res.json(400, { msg: "access denied" });
    }
});
router.post("/:id/dislike", isUser, async (req, res) => {
    let post = await Post.findById(req.params.id);
    let newLikes = post.likes.filter((like) => like._id.toHexString() != req.currentUser._id.toHexString());
    await Post.updateOne({ _id: post._id }, { likes: newLikes });
    let backUrl = req.header("Referer");
    if (backUrl.split("?").length > 1) {
        backUrl = backUrl.split("?")[0];
    }
    res.redirect(backUrl + "?alert=Post disliked");
});

const Comment = require("./models/comment");
router.post("/:id/comment", isUser, requireLogin, async (req, res) => {
    try {
        if (req.body.body.length >= 1) {
            let currentUser = await User.findOne({ username: req.currentUser.username });
            let post = await Post.findById(req.params.id);
            let comment = new Comment({
                body: req.body.body,
                author: currentUser._id,
                createdAt: Date.now(),
            });
            await comment.save();
            post.comments.push(comment);
            await Post.updateOne({ _id: post._id }, { comments: post.comments });
            res.redirect(
                req.header("Referer") + `?msg=Comment added successfully&&post=${post._id.toHexString()}`
            );
        } else {
            return res.redirect("/posts/" + req.params.id + "?msg=Can't send empty comment");
        }
    } catch (err) {
        res.redirect("/posts/" + req.params.id + "?msg=Error with adding comment");
        console.error(err);
    }
});

module.exports = router;
