const mongoose = require("mongoose");

const partnershipSchema = new mongoose.Schema({

    restaurant: {
        type: String,
        required: true
    },

    owner: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        required: true
    },

    city: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        default: "Pending"
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
    mongoose.models.Partnership ||
    mongoose.model("Partnership", partnershipSchema);