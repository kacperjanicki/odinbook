module.exports = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.render("errors/login_required", {
            currentUser: null,
        });
    }
};
