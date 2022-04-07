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
    season: {
        type: String,
        required: true
    },
    showId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("videos", videoSchema);