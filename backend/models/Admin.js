const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({

    fullName: {
        type: String,
        default: "FoodChain Administrator"
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    phone: {
        type: String,
        default: ""
    },

    password: {
        type: String,
        required: true,
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

    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordExpires: {
        type: Date,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

// Hash the password automatically whenever it's set/changed.
adminSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next();

    // Avoid re-hashing an already-hashed password (bcrypt hashes are 60 chars, start with $2)
    if (this.password && this.password.startsWith("$2") && this.password.length === 60) {
        return next();
    }

    if (!this.password) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();

});

adminSchema.methods.comparePassword = function (candidate) {

    if (!this.password) return false;

    return bcrypt.compare(candidate, this.password);

};

// Never leak the password hash or reset token in API responses.
adminSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
    }
});

module.exports =
mongoose.models.Admin ||
mongoose.model("Admin", adminSchema);
