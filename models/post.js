const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = require("./user");
const postSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        required: true,
    },
    public: {
        type: Boolean,
        required: true,
    },
    likes: {
        type: Array,
        required: false,
        default: [],
    },
    comments: {
        type: Array,
        required: false,
        default: [],
    },
});

module.exports = mongoose.model("Post", postSchema);
