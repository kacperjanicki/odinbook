module.exports = (req, res, next) => {
    if (req.currentUser) {
        next();
    } else {
        res.render("errors/login_required", {
            currentUser: null,
        });
    }
};
