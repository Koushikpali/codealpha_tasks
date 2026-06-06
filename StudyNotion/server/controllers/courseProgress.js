const mongoose = require("mongoose")
const Section = require("../modeles/Section")       // ✅ capital S
const SubSection = require("../modeles/SubSection") // ✅ capital S
const CourseProgress = require("../modeles/CourseProgress")
const Course = require("../modeles/course")         // optional: match filename


exports.updateCourseProgress = async (req, res) => {
  console.log("updateCourseProgress called", {
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user,
  });

  const { courseId, subsectionId } = req.body;
  const userId = req.user?.id;

  console.log("parsed values", { courseId, subsectionId, userId });

  try {
    // Validate subsection
    console.log("finding subsection by id:", subsectionId);
    const subsection = await SubSection.findById(subsectionId);
    console.log("subsection result:", subsection);

    if (!subsection) {
      console.log("❌ Subsection not found", { subsectionId });
      return res
        .status(404)
        .json({ success: false, message: "Invalid Subsection" });
    }

    // Find progress doc
    console.log("finding CourseProgress for user and course", {
      courseId,
      userId,
    });
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });
    console.log("courseProgress findOne result:", courseProgress);

    // If no progress doc -> create one
    if (!courseProgress) {
      console.log("➡️ Creating new CourseProgress record");

      courseProgress = await CourseProgress.create({
        userId,
        courseID: courseId,
        completedVideos: [subsectionId],
      });

      return res.status(200).json({
        success: true,
        message: "Progress created + video marked completed",
        data: courseProgress,
      });
    }

    // Already has progress doc
    console.log("existing completedVideos:", courseProgress.completedVideos);

    if (courseProgress.completedVideos.includes(subsectionId)) {
      console.log("⚠️ Subsection already completed", { subsectionId });
      return res.status(200).json({
        success: true,
        message: "Subsection already completed",
        data: courseProgress,
      });
    }

    // Push new completed video
    console.log("Adding subsection to completedVideos", subsectionId);
    courseProgress.completedVideos.push(subsectionId);
    await courseProgress.save();

    console.log("✅ Progress saved", courseProgress);

    return res.status(200).json({
      success: true,
      message: "Progress updated",
      data: courseProgress,
    });
  } catch (error) {
    console.error("💥 updateCourseProgress error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// exports.getProgressPercentage = async (req, res) => {
//   const { courseId } = req.body
//   const userId = req.user.id

//   if (!courseId) {
//     return res.status(400).json({ error: "Course ID not provided." })
//   }

//   try {
//     // Find the course progress document for the user and course
//     let courseProgress = await CourseProgress.findOne({
//       courseID: courseId,
//       userId: userId,
//     })
//       .populate({
//         path: "courseID",
//         populate: {
//           path: "courseContent",
//         },
//       })
//       .exec()

//     if (!courseProgress) {
//       return res
//         .status(400)
//         .json({ error: "Can not find Course Progress with these IDs." })
//     }
//     console.log(courseProgress, userId)
//     let lectures = 0
//     courseProgress.courseID.courseContent?.forEach((sec) => {
//       lectures += sec.subSection.length || 0
//     })

//     let progressPercentage =
//       (courseProgress.completedVideos.length / lectures) * 100

//     // To make it up to 2 decimal point
//     const multiplier = Math.pow(10, 2)
//     progressPercentage =
//       Math.round(progressPercentage * multiplier) / multiplier

//     return res.status(200).json({
//       data: progressPercentage,
//       message: "Succesfully fetched Course progress",
//     })
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({ error: "Internal server error" })
//   }
// }