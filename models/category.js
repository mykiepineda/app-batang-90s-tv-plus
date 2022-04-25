const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("categories", categorySchema);