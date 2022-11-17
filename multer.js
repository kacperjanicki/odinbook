const multer = require("multer");
const User = require("./models/user");
//set storage
var storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now());
    },
});

module.exports = store = multer({ storage: storage });
