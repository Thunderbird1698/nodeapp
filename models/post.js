const string = require("@hapi/joi/lib/types/string");
const mongoose = require("mongoose");

const postschema = mongoose.Schema({
    firstname:{
        type: String,
        required : true
    },
    lastname:{
        type: String,
        required: true
    },
    password:{
        type:string
    },
    email:{
        type:String
    },
    //pimage:{
      //  type:File
    //},
    date:{
        type:Date,
        default:Date.now 
    }
})

module.exports = mongoose.model("posts",postschema);