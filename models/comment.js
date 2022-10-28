const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    createdAt: {
        type: Date,
        required: true,
    },
});
commentSchema.pre("find", function (next) {
    this.populate("author");
    next();
});

module.exports = mongoose.model("Comment", commentSchema);
