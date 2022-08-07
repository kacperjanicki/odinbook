const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    public: {
        type: Boolean,
        required: true,
    },
});
module.exports = mongoose.model("Post", postSchema);
