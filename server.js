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
const checkuser = require("./middleware/isUser");
const Post = require("./models/post");
const User = require("./models/user");
const postRouter = require("./postRouter.js");
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));

app.use("/posts", postRouter);

app.get("/", checkuser, async (req, res) => {
    console.log(req.user);
    var posts = await Post.find({});
    res.render("index", {
        isUser: req.user ? true : false,
        posts: posts,
        msg: req.query.pass ? "logged in" : false,
        currentUser: req.user ? req.user.username : null,
    });
});
app.get("/signup", checkuser, (req, res) => {
    res.render("signup", { error: false, isUser: req.user ? true : false });
});
app.post("/signup", checkuser, async (req, res) => {
    try {
        var usr = await User.find({ username: req.body.username });
        if (usr.length != 0) {
            return res.render("signup", { error: "User already exists", isUser: false });
        } else {
            const user = new User({ username: req.body.username, password: req.body.password });
            await user.save();
            res.redirect("/login?username=" + req.body.username);
        }
    } catch (err) {
        console.error(err);
    }
});

app.get("/login", checkuser, (req, res) => {
    if (req.user) {
        res.redirect("/");
    } else {
        res.render("login", { error: false, isUser: false, username: req.query.username });
    }
});
app.post("/login", async (req, res) => {
    var user = await User.find({ username: req.body.username });

    if (user[0].password == req.body.password) {
        const token = await JWT.sign({ username: req.body.username }, process.env.TOKEN, {
            expiresIn: 36000,
        });
        res.cookie("token", token);
        res.redirect("/?pass=true");
    } else {
        return res.render("login", { error: "Invalid credentials", isUser: false });
    }
});
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

app.listen(process.env.PORT || 3201, () => {
    console.log("Running on port 3201");
});
