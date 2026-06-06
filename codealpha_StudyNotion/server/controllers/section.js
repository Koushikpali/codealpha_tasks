const Section = require("../modeles/Section");
const Course = require("../modeles/course");
const SubSection = require("../modeles/SubSection");

// CREATE a new section
exports.createSection = async (req, res) => {
  console.log("========== CREATE SECTION START ==========");
  console.log("Request Body:", req.body);

  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      console.log("❌ Missing required properties");
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    const newSection = await Section.create({ sectionName });
    console.log("✅ New Section Created:", newSection);

   const updatedCourse = await Course.findByIdAndUpdate(
  courseId,
  { $push: { courseContent: newSection._id } },
  { new: true }
)
.populate({
  path: "courseContent",
  populate: { path: "subSection" } // field in Section schema
})
.exec();


    console.log("📚 Updated Course:", updatedCourse);

    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    console.error("❌ Error creating section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
  console.log("========== CREATE SECTION END ==========");
};

// UPDATE a section
exports.updateSection = async (req, res) => {
  console.log("========== UPDATE SECTION START ==========");
  console.log("Request Body:", req.body);

  try {
    const { sectionName, sectionId, courseId } = req.body;

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    console.log("✅ Section Updated:", section);

    const course = await Course.findById(courseId)
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();
    console.log("📚 Updated Course after Section Update:", course);

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("❌ Error updating section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  console.log("========== UPDATE SECTION END ==========");
};

// DELETE a section
exports.deleteSection = async (req, res) => {
  console.log("========== DELETE SECTION START ==========");
  console.log("Request Body:", req.body);

  try {
    const { sectionId, courseId } = req.body;

    await Course.findByIdAndUpdate(courseId, { $pull: { courseContent: sectionId } });
    console.log(`🔹 Removed section ${sectionId} from course ${courseId}`);

    const section = await Section.findById(sectionId);
    if (!section) {
      console.log("❌ Section not found");
      return res.status(404).json({
        success: false,
        message: "Section not Found",
      });
    }

    await SubSection.deleteMany({ _id: { $in: section.subSection } });
    console.log("🔹 Deleted all subsections:", section.subSection);

    await Section.findByIdAndDelete(sectionId);
    console.log("✅ Section deleted:", sectionId);

    const course = await Course.findById(courseId)
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();
    console.log("📚 Updated Course after Section Deletion:", course);

    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    });
  } catch (error) {
    console.error("❌ Error deleting section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  console.log("========== DELETE SECTION END ==========");
};
