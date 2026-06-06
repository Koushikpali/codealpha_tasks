const Course = require("../modeles/course")
const Category = require("../modeles/Category")
const Section = require("../modeles/Section")
const SubSection = require("../modeles/SubSection")
const User = require("../modeles/user")
const { uploadImageToCloudinary } = require("../utils/uploadimg")
const CourseProgress = require("../modeles/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    console.log("📥 Incoming request to CREATE COURSE");

    // Get user ID from request object
    const userId = req.user?.id;
    console.log("👤 User ID:", userId);

    // Get all required fields from request body
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;

    console.log("📝 Request Body:", req.body);

    // Get thumbnail image from request files
    const thumbnail = req.files?.thumbnailImage;
    console.log("🖼 Thumbnail file received:", thumbnail ? thumbnail.name : "No thumbnail found");

    // Convert the tag and instructions from stringified Array to Array
    let tag = [];
    let instructions = [];
    try {
      tag = JSON.parse(_tag);
      instructions = JSON.parse(_instructions);
    } catch (parseError) {
      console.error("❌ JSON parsing failed:", parseError.message);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format for tag or instructions",
      });
    }

    console.log("🏷 Tags:", tag);
    console.log("📚 Instructions:", instructions);

    // Check if any of the required fields are missing
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }

    if (!status || status === undefined) {
      status = "Draft";
      console.log("✏️ Default status applied: Draft");
    }

    // Check if the user is an instructor
    console.log("🔍 Checking instructor details...");
    const instructorDetails = await User.findById(userId);
    console.log("👩‍🏫 Instructor Details:", instructorDetails);

    if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
      console.warn("⚠️ Instructor not found or invalid account type");
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found or User not an Instructor",
      });
    }

    // Check if the category given is valid
    console.log("🔍 Checking category...");
    const categoryDetails = await Category.findById(category);
    console.log("📁 Category Details:", categoryDetails);

    if (!categoryDetails) {
      console.warn("⚠️ Category not found");
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      });
    }

    // Upload the Thumbnail to Cloudinary
    console.log("☁️ Uploading thumbnail to Cloudinary...");
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    console.log("✅ Cloudinary Upload Result:", thumbnailImage);

    // Create a new course with the given details
    console.log("🛠 Creating new course document...");
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag:tag._id,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      
   
    });

    console.log("🎉 New Course Created:", newCourse);

    // Add the new course to the User Schema of the Instructor
    console.log("➕ Updating instructor with course...");
    await User.findByIdAndUpdate(
      instructorDetails._id,
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // Add the new course to the Category
    console.log("➕ Updating category with course...");
    const categoryDetails2 = await Category.findByIdAndUpdate(
      category,
      { $push: { courses: newCourse._id } },
      { new: true }
    );
    console.log("✅ Category Updated:", categoryDetails2);

    // Return the new course and a success message
    console.log("✅ Course Created Successfully");
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    });
  } catch (error) {
    // Handle any errors that occur during the creation of the course
    console.error("💥 ERROR creating course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    console.log("📥 Incoming request to EDIT COURSE");
    console.log("👤 Authenticated user:", req.user?.id ?? "no user");
    console.log("📝 Request body keys:", Object.keys(req.body));
    console.log("📁 Files present:", req.files ? Object.keys(req.files) : "no files");

    const { courseId } = req.body;
    const updates = req.body;

    console.log("🔍 Looking up course by id:", courseId);
    const course = await Course.findById(courseId);
    console.log("🔎 Course lookup result:", course ? "found" : "not found");

    if (!course) {
      console.warn("⚠️ Course not found:", courseId);
      return res.status(404).json({ error: "Course not found" });
    }

    // If Thumbnail Image is found, update it
    if (req.files && req.files.thumbnailImage) {
      console.log("🖼 Thumbnail update detected");
      try {
        const thumbnail = req.files.thumbnailImage;
        console.log("☁️ Uploading thumbnail to Cloudinary (field name:", thumbnail.name ?? "unknown", ")");
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        );
        console.log("✅ Thumbnail uploaded, secure_url:", thumbnailImage?.secure_url);
        course.thumbnail = thumbnailImage.secure_url;
      } catch (uploadErr) {
        console.error("❌ Thumbnail upload failed:", uploadErr);
        return res.status(500).json({
          success: false,
          message: "Thumbnail upload failed",
          error: uploadErr.message,
        });
      }
    } else {
      console.log("ℹ️ No thumbnail file provided in request");
    }

    // Update only the fields that are present in the request body
    console.log("♻️ Updating course fields...");
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        try {
          if (key === "tag" || key === "instructions") {
            console.log(`🔁 Parsing and updating array field "${key}"`);
            course[key] = JSON.parse(updates[key]);
            console.log(`✅ Field "${key}" updated to:`, course[key]);
          } else if (key === "courseId") {
            console.log('↩️ Skipping "courseId" field from updates');
            // skip courseId
          } else {
            console.log(`🔁 Updating field "${key}" to:`, updates[key]);
            course[key] = updates[key];
          }
        } catch (parseError) {
          console.error(`❌ Failed to parse field "${key}":`, parseError.message);
          return res.status(400).json({
            success: false,
            message: `Invalid JSON for field ${key}`,
            error: parseError.message,
          });
        }
      }
    }

    console.log("💾 Saving updated course to DB...");
    await course.save();
    console.log("✅ Course saved");

    console.log("🔍 Fetching populated updated course for response");
    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("Category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    console.log("📤 Responding with updated course");
    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("💥 ERROR in editCourse:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    console.log("📥 Incoming request to GET ALL COURSES");
    console.log("🔍 Querying for published courses...");

    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    console.log("✅ Retrieved courses count:", allCourses.length);
    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    console.error("💥 ERROR in getAllCourses:", error);
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    });
  }
}
// Get One Single Course Details
// exports.getCourseDetails = async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const courseDetails = await Course.findOne({
//       _id: courseId,
//     })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec()
//     // console.log(
//     //   "###################################### course details : ",
//     //   courseDetails,
//     //   courseId
//     // );
//     if (!courseDetails || !courseDetails.length) {
//       return res.status(400).json({
//         success: false,
//         message: `Could not find course with id: ${courseId}`,
//       })
//     }

//     if (courseDetails.status === "Draft") {
//       return res.status(403).json({
//         success: false,
//         message: `Accessing a draft course is forbidden`,
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       data: courseDetails,
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }
exports.getCourseDetails = async (req, res) => {
  console.log("🟢 [getCourseDetails] Request received");

  try {
    console.log("➡️ Request body:", req.body);
    const { courseId } = req.body;
    console.log("📘 Course ID received:", courseId);

    if (!courseId) {
      console.warn("⚠️ No courseId provided in request body");
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    console.log("🔍 Fetching course details from DB...");
    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("Category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "title description timeduration videoUrl",
        },
      })
      .exec();

    console.log(
      "📦 Course details fetched:",
      courseDetails ? "✅ Found" : "❌ Not Found"
    );

    if (!courseDetails) {
      console.error("🚫 No course found for ID:", courseId);
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    console.log("🧠 Computing total course duration...");
    let totalDurationInSeconds = 0;

    courseDetails.courseContent.forEach((content, i) => {
      console.log(`📂 CourseContent[${i}] ID:`, content._id);

      if (!content.subSection) {
        console.warn(`⚠️ No subSection found for CourseContent[${i}]`);
        return;
      }

      content.subSection.forEach((subSection, j) => {
        console.log(`🎞️ SubSection[${j}] ID:`, subSection._id);
        console.log(`⏱️ SubSection[${j}] Duration:`, subSection.timeduration);
        const timeDurationInSeconds = parseInt(subSection.timeduration || 0);
        totalDurationInSeconds += timeDurationInSeconds;
      });

    });

    console.log("🧮 Total duration in seconds:", totalDurationInSeconds);
    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);
    console.log("🕒 Total duration formatted:", totalDuration);

    console.log("✅ [getCourseDetails] Sending success response...");
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    });
  } catch (error) {
    console.error("💥 [getCourseDetails] Error occurred:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    console.log("🏁 [getCourseDetails] Function execution finished.\n");
  }
};
exports.getFullCourseDetails = async (req, res) => {
  const startTime = Date.now();
  console.log("🟢 [getFullCourseDetails] - Start");
  try {
    console.log("➡️ Request received");
    console.log("   - Headers:", req.headers);
    console.log("   - Params:", req.params);
    console.log("   - Query:", req.query);
    console.log("   - Body:", req.body);
    console.log("   - Files:", req.files);
    console.log("   - Authenticated user:", req.user);

    const { courseId } = req.body || {};
    const userId = req.user?.id;

    console.log("🔎 Parsed inputs:");
    console.log("   - courseId:", courseId);
    console.log("   - userId:", userId);

    if (!courseId) {
      console.warn("⚠️ Missing courseId in request body");
      console.log("🏁 [getFullCourseDetails] - End (missing courseId) - elapsed:", Date.now() - startTime, "ms");
      return res
        .status(400)
        .json({ success: false, message: "Course ID is required" });
    }

    if (!userId) {
      console.warn("⚠️ Missing authenticated user (userId)");
      console.log("🏁 [getFullCourseDetails] - End (unauthorized) - elapsed:", Date.now() - startTime, "ms");
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    console.log("☁️ Querying database for course details with population...");
    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({ path: "instructor", populate: { path: "additionalDetails" } })
      .populate("Category")
      .populate("ratingAndReviews")
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();

    console.log("📦 DB result - courseDetails:", courseDetails ? "FOUND" : "NOT FOUND");
    if (courseDetails) {
      // Log summary of important fields to avoid extremely large console dumps
      try {
        console.log("   - courseDetails._id:", courseDetails._id);
        console.log("   - courseDetails.courseName:", courseDetails.courseName);
        console.log("   - courseDetails.status:", courseDetails.status);
        console.log("   - instructor id:", courseDetails.instructor?._id);
        console.log("   - category id:", courseDetails.category ?? courseDetails.Category?._id);
        console.log("   - courseContent length:", Array.isArray(courseDetails.courseContent) ? courseDetails.courseContent.length : 0);
        console.log("   - studentsEnrolled length:", Array.isArray(courseDetails.studentsEnrolled) ? courseDetails.studentsEnrolled.length : 0);
      } catch (shallowLogErr) {
        console.warn("⚠️ Error while logging courseDetails summary:", shallowLogErr);
      }
    } else {
      console.error("🚫 Course not found for id:", courseId);
      console.log("🏁 [getFullCourseDetails] - End (course not found) - elapsed:", Date.now() - startTime, "ms");
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    console.log("☑️ Fetching course progress for user and course...");
    const courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    console.log("📈 DB result - courseProgressCount:", courseProgressCount ? "FOUND" : "NOT FOUND");
    if (courseProgressCount) {
      try {
        console.log("   - courseProgressCount._id:", courseProgressCount._id);
        console.log("   - courseProgressCount.progress (if present):", courseProgressCount.progress);
      } catch (ppLogErr) {
        console.warn("⚠️ Error while logging courseProgressCount summary:", ppLogErr);
      }
    }

    console.log("✅ Preparing response payload");
    const payload = { courseDetails, courseProgressCount };
    console.log("📤 Sending response - payload keys:", Object.keys(payload));

    console.log("🏁 [getFullCourseDetails] - End (success) - elapsed:", Date.now() - startTime, "ms");
    return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error("💥 [getFullCourseDetails] - Error:", error);
    console.log("🏁 [getFullCourseDetails] - End (error) - elapsed:", Date.now() - startTime, "ms");
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}