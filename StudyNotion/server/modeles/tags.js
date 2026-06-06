const mongoose=require("mongoose");
const course = require("./course");
const tagsSchema  = new mongoose.Schema({
    course:[{
        type:mongoose.Schema.Types.ObjectId,
        
        ref:'course'
    }],
    description:{
       type:String,
        
    },
    name:{
        type:String,
        required:true,

    }
    
});

module.exports = mongoose.model('tagsSchema', tagsSchema);