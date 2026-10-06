const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    author: {
        type: String,
        required: true
    },

    readingTime: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },

    content: {
        type: String,
        default: ""
    },

    image: {
        type: String,
        default: ""
    },

    featured: {
        type: Boolean,
        default: false
    },

    date: {
        type: String,
        default: () => new Date().toLocaleDateString()
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports =
mongoose.models.Blog ||
mongoose.model("Blog", blogSchema);