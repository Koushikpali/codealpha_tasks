const mongoose = require('mongoose');
const section=mongoose.Schema(
    {
        sectionName:{
            type:String,
        }
        ,subSection:[
            {type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Subsection"}
        ]
 
    }
)

module.exports = mongoose.model('section', section);