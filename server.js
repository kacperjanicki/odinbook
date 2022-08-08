if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express"); //npm i express ejs express-ejs-layoutsnpm i express ejs express-ejs-layouts
const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); //create folder views
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

app.use(express.static("public")); //create folder public
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const checkuser = require("./middleware/isUser");
const Post = require("./models/post");
const User = require("./models/user");
const postRouter = require("./postRouter.js");
const userRouter = require("./userRouter.js");
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));

app.use("/posts", postRouter);
app.use("/profile", userRouter);

app.get("/", checkuser, async (req, res) => {
    var posts = await Post.find({});
    console.log(req.user);
    res.render("index", {
        isUser: req.user ? true : false,
        posts: posts,
        msg: req.query.pass ? "logged in" : false,
        currentUser: req.user ? req.user.username : null,
    });
});
app.get("/signup", checkuser, (req, res) => {
    res.render("signup", {
        error: false,
        isUser: req.user ? true : false,
        currentUser: req.user ? req.user.username : null,
    });
});
app.post("/signup", checkuser, async (req, res) => {
    let passMatch = req.body.password == req.body.confirm_password;
    try {
        var usr = await User.find({ username: req.body.username });
        if (usr.length != 0) {
            return res.status(401).render("signup", { error: "User already exists", isUser: false });
        } else if (!passMatch) {
            return res.status(401).render("signup", { error: "Passwords do not match", isUser: false });
        } else {
            let hashed_pass = await bcrypt.hash(req.body.password, 10);
            const user = new User({
                username: req.body.username,
                password: hashed_pass,
                dateOfBirth: req.body.date,
            });
            await user.save();
            res.status(201).redirect(
                "/login?username=" + req.body.username + "&msg=Account created, now you can log in"
            );
        }
    } catch (err) {
        console.error(err);
    }
});

app.get("/login", checkuser, (req, res) => {
    if (req.user) {
        res.redirect("/");
    } else {
        res.render("login", {
            error: false,
            currentUser: req.user ? req.user : null,
            username: req.query.username,
            msg: req.query.msg ? req.query.msg : null,
        });
    }
});
app.post("/login", async (req, res) => {
    var user = await User.find({ username: req.body.username });
    let isValid = await bcrypt.compare(req.body.password, user[0].password);

    if (isValid) {
        const token = await JWT.sign({ username: req.body.username }, process.env.TOKEN, {
            expiresIn: 36000,
        });
        res.cookie("token", token);
        res.status(200).redirect("/?pass=true");
    } else {
        return res.status(401).render("login", { error: "Invalid credentials", isUser: false });
    }
});
app.get("/logout", checkuser, (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

app.get("*", (req, res) => {
    res.status(404).render("errors/404", {
        isUser: req.user ? true : false,
        currentUser: req.user ? req.user.username : null,
    });
});

app.listen(process.env.PORT || 3201, () => {
    console.log("Running on port 3201");
});
