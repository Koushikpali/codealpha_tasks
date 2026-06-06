const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  
courseID:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"course"
},
completedVideos:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"subsection",
    }
]

});

const CourseProgress =
  mongoose.models.CourseProgress || mongoose.model('CourseProgress', courseProgressSchema);

module.exports = CourseProgress;