const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({

    fullName: {
        type: String,
        default: "FoodChain Administrator"
    },

    email: {
        type: String,
        required: true,
        unique: true,
        // default: "admin@foodchain.com"
    },

    phone: {
        type: String,
        default: ""
    },

    password: {
        type: String,
        required: true,
        // default: "FoodChain@2026"
    },

    profileImage: {
        type: String,
        default: ""
    },

    darkMode: {
        type: Boolean,
        default: false
    },

    emailNotifications: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports =
mongoose.models.Admin ||
mongoose.model("Admin", adminSchema);