const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    date: {
        type: String,
        default: () => new Date().toLocaleDateString()
    }
});

module.exports = mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema);