const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    friends: {
        type: Array,
        required: false,
        default: [],
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
});
module.exports = mongoose.model("User", userSchema);
