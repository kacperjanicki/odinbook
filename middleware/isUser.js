const JWT = require("jsonwebtoken");
module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        let user = await JWT.verify(token, process.env.TOKEN);

        req.user = user;
        next();
    } catch (e) {
        next();
        // return res.status(400).json({ msg: "access denied" });
    }
};
