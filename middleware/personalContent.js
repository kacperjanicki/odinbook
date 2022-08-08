module.exports = (req, res, next) => {
    if (req.user.username == req.params.username) {
        next();
    } else {
        return res.status(403).send("access denied");
    }
};
