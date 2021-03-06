const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    posted: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    image: {
        type: String,
        default: "/default_pfp.png"
    },
    caption: {
        type: String,
        required: true
    },
    likes: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model("post", PostSchema, "posts");
