const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    coverImage: {
        type: String,
        default: ""
    },

    logo: {
        type: String,
        default: ""
    },

    rating: {
        type: String,
        default: "New"
    },

    deliveryTime: {
        type: String,
        default: "-"
    },

    deliveryFee: {
        type: String,
        default: ""
    },

    phone: {
        type: String,
        default: ""
    },

    address: {
        type: String,
        default: ""
    },

    website: {
        type: String,
        default: ""
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports =
    mongoose.models.Restaurant ||
    mongoose.model("Restaurant", restaurantSchema);