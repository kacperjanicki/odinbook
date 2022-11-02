if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express"); //npm i express ejs express-ejs-layoutsnpm i express ejs express-ejs-layouts
const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); //create folder views
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
app.use(bodyParser.json());
var fs = require("fs");
app.use(express.static("public")); //create folder public
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const FacebookStrategy = require('passport-facebook').Strategy
const checkuser = require("./middleware/isUser");
const Post = require("./models/post");
const User = require("./models/user");
const postRouter = require("./postRouter.js");
const userRouter = require("./userRouter.js");
const userIndexRouter = require("./userIndexRouter.js");
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, () => {
    console.log("Connected to MongoDB");
});
const db = mongoose.connection;

db.on("error", (error) => console.error(error));

app.use("/users", userIndexRouter);
app.use("/posts", postRouter);
app.use("/profile", userRouter);

const isPostLiked = require("./public/postLiked");
const isLikeFriend = require("./public/isLikeFriend");
app.get("/", checkuser, async (req, res) => {
    var posts = await Post.find({}).populate("author").populate("comments");
    isPostLiked(posts, req.currentUser);
    isLikeFriend(posts, req.currentUser); //add to friends button function
    res.render("all_posts", {
        singlePost: false,
        currentUser: req.currentUser ? req.currentUser : false,
        posts: posts,
        msg: req.query.pass ? "Logged in" : req.query.msg,
    });
});
app.get("/signup", checkuser, async (req, res) => {
    res.render("signup", {
        error: false,
        msg: req.query.msg ? req.query.msg : null,
        currentUser: req.currentUser ? req.currentUser : false,
    });
});

store = require("./multer");
app.post("/signup", checkuser, store.single("profilePic"), async (req, res) => {
    let passMatch = req.body.password == req.body.confirm_password;
    try {
        var usr = await User.findOne({ username: req.body.username });
        if (usr) {
            return res.status(401).render("signup", {
                error: "User already exists",
                user: req.user ? await User.findOne({ username: req.user.username }) : null,
            });
        } else if (!passMatch) {
            return res.status(401).render("signup", {
                error: "Passwords do not match",
                user: req.user ? await User.findOne({ username: req.user.username }) : null,
            });
        } else {
            let hashed_pass = await bcrypt.hash(req.body.password, 10);
            let fnameCapitalized = req.body.fname.charAt(0).toUpperCase() + req.body.fname.slice(1);
            let lnameCapitalized = req.body.lname.charAt(0).toUpperCase() + req.body.lname.slice(1);
            const user = new User({
                fname: fnameCapitalized,
                lname: lnameCapitalized,
                username: req.body.username,
                password: hashed_pass,
                dateOfBirth: new Date(req.body.date),
                //profile image
                filename: req.file ? req.file.originalname : "Facebook-default-no-profile-pic.jpg",
                contentType: req.file ? req.file.mimetype : "image/jpeg",
                imageBase64: req.file
                    ? fs.readFileSync(req.file.path).toString("base64")
                    : fs.readFileSync("./public/Facebook-default-no-profile-pic.jpg").toString("base64"),
            });
            try {
                await user.save();
                res.redirect(
                    "/login?username=" + req.body.username + "&msg=Account created, now you can log in"
                );
            } catch (err) {
                res.status(400).redirect("/signup?msg=Error while creating an account");
                console.error(err);
            }
        }
    } catch (err) {
        console.error(err);
    }
});

app.get("/login", checkuser, async (req, res) => {
    if (req.currentUser) {
        res.redirect("/");
    } else {
        res.render("login", {
            error: false,
            currentUser: req.currentUser ? req.currentUser : false,
            msg: req.query.msg ? req.query.msg : null,
        });
    }
});
app.post("/login", async (req, res) => {
    try {
        var user = await User.findOne({ username: req.body.username });
        let isValid = await bcrypt.compare(req.body.password, user.password);
        if (isValid) {
            const token = await JWT.sign({ username: req.body.username }, process.env.TOKEN, {
                expiresIn: 36000,
            });
            res.cookie("token", token);
            res.status(200).redirect("/?pass=true");
        } else {
            return res.status(401).redirect("/login?msg=Invalid credentials");
        }
    } catch {
        return res.status(401).redirect("/login?msg=Invalid credentials");
    }
});
app.get("/logout", checkuser, (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

app.get("*", checkuser, async (req, res) => {
    res.status(404).render("errors/404", {
        isUser: req.user ? true : false,
        currentUser: req.user ? await User.findOne({ username: req.user.username }) : null,
    });
});

app.listen(process.env.PORT || 3201, () => {
    console.log("Running on port 3201");
});
