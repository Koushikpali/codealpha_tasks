const Profile = require("../modeles/profile")
const CourseProgress = require("../modeles/CourseProgress")

const Course = require("../modeles/course")
const User = require("../modeles/user")
const { uploadImageToCloudinary } = require("../utils/uploadimg")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    const id = req.user.id

    // Find the profile by id
    const userDetails = await User.findById(id)
    const profile = await Profile.findById(userDetails.additionalDetails)

    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    })
    await user.save()

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth
    profile.about = about
    profile.contactNumber = contactNumber
    profile.gender = gender

    // Save the updated profile
    await profile.save()

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
    console.log(id)
    const user = await User.findById({ _id: id })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.additionalDetails),
    })
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnroled: id } },
        { new: true }
      )
    }
    // Now Delete User
    await User.findByIdAndDelete({ _id: id })
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
    await CourseProgress.deleteMany({ userId: id })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
    console.log(userDetails)
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.getEnrolledCourses = async (req, res) => {
  try {
    console.log("getEnrolledCourses called");
    console.log("Request user:", req.user);
    console.log("Request headers:", req.headers);
    console.log("Request params:", req.params);
    console.log("Request query:", req.query);
    console.log("Request body:", req.body);
    if (req.files) console.log("Request files keys:", Object.keys(req.files));

    const userId = req.user.id;
    console.log("User ID:", userId);

    let userDetails = await User.findOne({ _id: userId })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();

    console.log("Fetched userDetails from DB (mongoose document):", userDetails);

    if (!userDetails) {
      console.log("No user found with this ID:", userId);
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userId}`,
      });
    }

    userDetails = userDetails.toObject();
    console.log("Converted userDetails to plain object. Keys:", Object.keys(userDetails));
    console.log("Courses count:", (userDetails.courses || []).length);

    for (let i = 0; i < (userDetails.courses || []).length; i++) {
      let totalDurationInSeconds = 0;
      let SubsectionLength = 0;

      console.log(`Processing course index ${i}:`, {
        id: userDetails.courses[i]._id,
        name: userDetails.courses[i].courseName,
      });

      const courseContent = userDetails.courses[i].courseContent || [];
      console.log(`  courseContent sections count: ${courseContent.length}`);

      for (let j = 0; j < courseContent.length; j++) {
        const section = courseContent[j];
        const subSections = section.subSection || [];

        console.log(`  Processing section ${j}:`, {
          sectionName: section.sectionName,
          subSectionsCount: subSections.length,
        });
        console.log("    Subsections sample (first 5):", subSections.slice(0, 5));

        const sectionSeconds = subSections.reduce((acc, curr) => {
          const val = Number(curr.timeDuration || 0);
          if (Number.isNaN(val)) {
            console.log("    Warning: non-numeric timeDuration found:", curr.timeDuration, "in", curr);
            return acc;
          }
          return acc + val;
        }, 0);

        console.log(`    total seconds for section ${j}:`, sectionSeconds);

        totalDurationInSeconds += sectionSeconds;
        SubsectionLength += subSections.length;
      }

      userDetails.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds);
      console.log("  Total duration in seconds for course:", totalDurationInSeconds);
      console.log("  Converted totalDuration:", userDetails.courses[i].totalDuration);
      console.log("  Total subsections length:", SubsectionLength);

      let courseProgress = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      });

      console.log("  CourseProgress from DB:", courseProgress);

      const completedVideosCount = courseProgress?.completedVideos?.length || 0;
      console.log("  Completed videos count:", completedVideosCount);

      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100;
      } else {
        const multiplier = Math.pow(10, 2);
        const percent = Math.round((completedVideosCount / SubsectionLength) * 100 * multiplier) / multiplier;
        userDetails.courses[i].progressPercentage = percent;
      }

      console.log("  Progress percentage for course:", userDetails.courses[i].progressPercentage);
    }

    console.log("Final courses with progress (sample first 3):", JSON.stringify((userDetails.courses || []).slice(0, 3), null, 2));

    const responseBody = {
      success: true,
      data: userDetails.courses,
    };
    console.log("Response body prepared:", {
      success: responseBody.success,
      coursesCount: (responseBody.data || []).length,
    });

    return res.status(200).json(responseBody);
  } catch (error) {
    console.error("Error in getEnrolledCourses:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })
 console.log("here is",courseDetails)
    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated =(totalStudentsEnrolled * course.price)
 

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}