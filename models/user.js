const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],

    friend_requests: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
            default: [],
        },
    ],
    sent_requests: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
            default: [],
        },
    ],
    joined: {
        type: Date,
        required: false,
        default: Date.now(),
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    filename: {
        type: String,
        required: true,
        unique: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    imageBase64: {
        type: String,
        required: true,
    },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
});

module.exports = mongoose.model("User", userSchema);
