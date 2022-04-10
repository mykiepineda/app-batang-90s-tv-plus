const mongoose = require("mongoose");
const watchlistSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    shows: {
        type: Array,
        required: false
    }
});

module.exports = mongoose.model("watchlist", watchlistSchema);