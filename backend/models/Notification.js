const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    message: {
        type: String,
        required: true
    },

    link: {
        type: String,
        default: ""
    },

    read: {
        type: Boolean,
        default: false
    },

    date: {
        type: String,
        default: () => new Date().toLocaleString()
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports =
mongoose.models.Notification ||
mongoose.model("Notification", notificationSchema);