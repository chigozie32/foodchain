const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    phone:{
        type:String,
        default:""
    },

    subject:{
        type:String,
        required:true
    },

    message:{
        type:String,
        required:true
    },

    status:{
        type:String,
        default:"Unread"
    },

    date:{
        type:String,
        default:()=>new Date().toLocaleDateString()
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

module.exports =
mongoose.models.Message ||
mongoose.model("Message",messageSchema);