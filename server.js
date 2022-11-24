if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express"); //npm i express ejs express-ejs-layoutsnpm i express ejs express-ejs-layouts
const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); //create folder views
const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    res.render("main", {
        singlePost: false,
        currentUser: req.currentUser ? req.currentUser : false,
        posts: posts,
        msg: req.query.pass ? "Logged in" : req.query.msg,
        alert: req.query.alert,
    });
});
app.get("/signup", checkuser, async (req, res) => {
    console.log(req.currentUser);
    res.render("signup", {
        error: false,
        alert: req.query.alert,
        msg: req.query.msg ? req.query.msg : null,
        currentUser: req.currentUser ? req.currentUser : false,
    });
});

multer = require("multer");
app.post("/signup", checkuser, async (req, res) => {
    console.log(req);
    let passMatch = req.body.password == req.body.confirm_password;
    try {
        var usr = await User.findOne({ username: req.body.username });
        if (usr) {
            return res.status(401).render("signup", {
                error: "User already exists",
                currentUser: req.currentUser,
            });
        } else if (!passMatch) {
            return res.status(401).render("signup", {
                error: "Passwords do not match",
                currentUser: req.currentUser,
            });
        } else {
            let hashed_pass = await bcrypt.hash(req.body.password, 10, (err) => {
                console.log(err);
            });
            let fnameCapitalized = req.body.fname.charAt(0).toUpperCase() + req.body.fname.slice(1);
            let lnameCapitalized = req.body.lname.charAt(0).toUpperCase() + req.body.lname.slice(1);
            let user = new User({
                fname: fnameCapitalized,
                lname: lnameCapitalized,
                username: req.body.username,
                password: hashed_pass,
                dateOfBirth: new Date(req.body.date),
                //here when you dont provide a profile picture when creating an account a deafult one will be assigned
                filename: req.file ? req.file.originalname : "men.jpg",
                contentType: req.file ? req.file.mimetype : "image/jpeg",
                imageBase64: req.file
                    ? fs.readFileSync(req.file.path).toString("base64")
                    : fs.readFileSync("./public/images/men.jpg").toString("base64"),
            });
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
            upload(req, res, async (err) => {
                try {
                    await user.save();
                } catch (err) {
                    console.error(err);
                }
                if (err) {
                    res.status(400).redirect("/signup?msg=Error while creating an account");
                } else {
                    return res.status(201).redirect(`/signup?msg=Account created, now you can log in`);
                }
            });
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
            error: req.query.error,
            alert: req.query.alert,

            currentUser: req.currentUser ? req.currentUser : false,
            msg: req.query.msg ? req.query.msg : null,
        });
    }
});
app.post("/login", async (req, res) => {
    console.log(req.body);
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
            return res.status(401).redirect("/login?error=Invalid credentials");
        }
    } catch (err) {
        console.error(err);
        return res.status(401).redirect("/login?error=Invalid credentials");
    }
});
app.get("/logout", checkuser, (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

app.get("*", checkuser, (req, res) => {
    res.status(404).render("errors/404", {
        isUser: req.currentUser ? true : false,
        currentUser: req.currentUser,
    });
});

app.listen(process.env.PORT || 3201, () => {
    console.log("Running on port 3201");
});
