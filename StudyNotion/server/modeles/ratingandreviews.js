const mongoose=require("mongoose");
const course = require("./course");
const ratingandreview = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,

        ref:'user'
    },
    course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		
	},
    rating:{
       type:Number,
        required:true,
        
    },
    review:{
        type:String,
        required:true,

    }
    
});

module.exports = mongoose.model('ratingandreview', ratingandreview);