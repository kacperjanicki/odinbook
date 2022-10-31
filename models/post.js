const mongoose = require("mongoose");
const Schema = mongoose.Schema;
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
    privacy: {
        type: String,
        required: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User", sparse: true }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

postSchema.pre("find", function (next) {
    this.populate("likes");
    next();
});
postSchema.pre("findOne", function (next) {
    this.populate("likes");
    next();
});

module.exports = mongoose.model("Post", postSchema);
