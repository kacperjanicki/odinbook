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
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));

app.use("/posts", postRouter);
app.use("/profile", userRouter);

app.get("/", checkuser, async (req, res) => {
    var posts = await Post.find({}).populate("author");
    res.render("index", {
        isUser: req.user ? true : false,
        posts: posts,
        user: req.user ? await User.findOne({ username: req.params.username }) : null,
        msg: req.query.pass ? "logged in" : null,
        currentUser: req.user ? req.user.username : null,
    });
});
app.get("/signup", checkuser, (req, res) => {
    res.render("signup", {
        error: false,
        msg: req.query.msg ? req.query.msg : null,
        currentUser: req.user ? req.user.username : null,
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

                currentUser: req.user ? req.user.username : null,
            });
        } else if (!passMatch) {
            return res.status(401).render("signup", {
                error: "Passwords do not match",
                currentUser: req.user ? req.user.username : null,
            });
        } else {
            let hashed_pass = await bcrypt.hash(req.body.password, 10);
            if (req.file) {
                let img = fs.readFileSync(req.file.path).toString("base64");
            }
            const user = new User({
                username: req.body.username,
                password: hashed_pass,
                dateOfBirth: new Date(req.body.date),
                //profile image
                filename: req.file ? req.file.originalname : "Facebook-default-no-profile-pic.jpg",
                contentType: req.file ? req.file.mimetype : "image/jpeg",
                imageBase64: req.file
                    ? img
                    : fs.readFileSync("./public/Facebook-default-no-profile-pic.jpg").toString("base64"),
            });
            try {
                await user.save();
                return res.redirect(
                    "/login?username=" + req.body.username + "&msg=Account created, now you can log in"
                );
            } catch (err) {
                res.status(400).redirect("signup?msg=Error while creating an account");
                console.error(err);
            }
        }
    } catch (err) {
        console.error(err);
    }
});

app.get("/login", checkuser, (req, res) => {
    console.log(req.query);
    if (req.user) {
        res.redirect("/");
    } else {
        res.render("login", {
            error: false,
            currentUser: req.user ? req.user : null,
            username: req.query.username ? req.query.username : "",
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

app.get("*", checkuser, (req, res) => {
    res.status(404).render("errors/404", {
        isUser: req.user ? true : false,
        currentUser: req.user ? req.user.username : null,
    });
});

app.listen(process.env.PORT || 3201, () => {
    console.log("Running on port 3201");
});

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
function saveProfpic(user, file) {
    if (file == null) return;
    const prof = JSON.parse(file);

    if (prof != null && imageMimeTypes.includes(prof.type)) {
        user.profPic = new Buffer.from(prof.data, "base64");
        user.profPicType = prof.type;
    }
}
