const JWT = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        let user = await JWT.verify(token, process.env.TOKEN);
        req.currentUser = await User.findOne({ username: user.username })
            .populate("friend_requests")
            .populate("sent_requests");
        next();
    } catch (e) {
        req.currentUser = null;
        next();
        // return res.status(400).json({ msg: "access denied" });
    }
};
