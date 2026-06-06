const RatingAndReview = require("../modeles/ratingandreviews");
const Course = require("../modeles/course");
const User = require("../modeles/user");
const mongoose = require("mongoose");

// ======================================================================
//  CREATE RATING
// ======================================================================
exports.createRating = async (req, res) => {
  console.log("🔥 createRating called", {
    body: req.body,
    params: req.params,
    query: req.query,
  });

  try {
    const { rate, review, userid, courseid } = req.body;
    console.log("Parsed inputs", { rate, review, userid, courseid });

    if (!rate || !review || !userid || !courseid) {
      console.log("❌ Missing fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: rate, review, userid, courseid",
      });
    }

    // Check course exists
    const courseDetail = await Course.findById(courseid);
    console.log("Course lookup", { courseDetail });

    if (!courseDetail) {
      console.log("❌ Course not found");
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Temporary - assume enrolled
    const isEnrolled = true;
    console.log("Enrollment check:", isEnrolled);

    // Check if user already rated
    const alreadyRated = await RatingAndReview.findOne({
      user: userid,
      course: courseid,
    });
    console.log("Already rated check:", alreadyRated);

    // if (alreadyRated) {
    //   console.log("❌ User already rated this course");
    //   return res.status(400).json({
    //     success: false,
    //     message: "User has already rated this course",
    //   });
    // }

    // Create new rating
    const newRating = await RatingAndReview.create({
      user: userid,
      course: courseid,
      rating: rate,
      review: review,
    });
    console.log("⭐ New rating created", newRating);

    // Push rating reference to existing course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseid,
      { $push: { ratingAndReviews: newRating._id } },
      { new: true }
    );
    console.log("📌 Rating added to course:", updatedCourse);

    return res.status(200).json({
      success: true,
      message: "Rating created successfully",
      data: newRating,
    });
  } catch (error) {
    console.error("🔥 Error creating rating:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================================
//  GET AVERAGE RATING
// ======================================================================
exports.getAverageRating = async (req, res) => {
  console.log("🔥 getAverageRating called", {
    body: req.body,
    params: req.params,
    query: req.query,
  });

  try {
    const { courseid } = req.body;
    console.log("Course ID:", courseid);

    if (!courseid) {
      console.log("❌ No courseid provided");
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const average = await RatingAndReview.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseid) } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    console.log("Average aggregation result:", average);

    if (average.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: average[0].averageRating,
      });
    }

    return res.status(200).json({
      success: true,
      averageRating: 0,
      message: "No ratings yet",
    });
  } catch (error) {
    console.error("🔥 Error calculating average:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================================
//  GET ALL RATINGS FOR A COURSE
// ======================================================================
exports.getAllRating = async (req, res) => {
  console.log("🔥 getAllRating called", {
    body: req.body,
    params: req.params,
    query: req.query,
  });

  try {
    // Work for ALL cases: body, params, or query
    const courseid =
      req.body.courseid || req.params.courseid || req.query.courseid;

    console.log("Resolved courseid:", courseid);

    if (!courseid) {
      console.log("❌ No courseid provided");
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // IMPORTANT: correct field name is "ratingAndReviews" (plural)
    const courseDetails = await Course.findById(courseid)
      .populate({
        path: "ratingAndReviews", // FIXED
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "user",
          select: "firstName lastName email",
        },
      })
      .exec();

    console.log("Course details with populated reviews", {
      exists: !!courseDetails,
      reviewsCount: courseDetails?.ratingAndReviews?.length,
    });

    if (!courseDetails) {
      console.log("❌ Course not found");
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: courseDetails.ratingAndReviews, // FIXED
    });
  } catch (error) {
    console.error("🔥 Error fetching all ratings:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
