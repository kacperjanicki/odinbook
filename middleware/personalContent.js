module.exports = (req, res, next) => {
    if (req.currentUser.username == req.params.username) {
        next();
    } else {
        return res.json(403, { response_code: 403, msg: "Access denied" });
    }
};
