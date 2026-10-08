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
// Written as a plain async function with no next() callback —
// modern Mongoose runs pre-save hooks by awaiting the function's
// own promise, and some installed versions no longer pass a
// working next() callback at all, which was crashing every save.
adminSchema.pre("save", async function () {

    if (!this.isModified("password")) return;

    // Avoid re-hashing an already-hashed password (bcrypt hashes are 60 chars, start with $2)
    if (this.password && this.password.startsWith("$2") && this.password.length === 60) {
        return;
    }

    if (!this.password) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

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