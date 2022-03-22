const mongoose = require("mongoose");
const videoSchema = new mongoose.Schema({
    episode: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    synopsis: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    bookmarked: {
        type: Boolean,
        default: false,
        required: true
    },
    season: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("videos", videoSchema);