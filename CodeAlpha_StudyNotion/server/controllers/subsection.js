// Import necessary modules
const Section = require("../modeles/Section");
const SubSection = require("../modeles/SubSection");
const { uploadImageToCloudinary } = require("../utils/uploadimg");

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILES:", req.files);

    const { sectionId, title, description } = req.body;
    const video = req?.files?.video;

    if (!sectionId || !title || !description || !video) {
      console.log("Missing required fields!");
      return res
        .status(404)
        .json({ success: false, message: "All Fields are Required" });
    }
    console.log("Video file info:", video);

    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    console.log("Upload Details:", uploadDetails);

    const SubSectionDetails = await SubSection.create({
      title,
      timeDuration: `${uploadDetails.duration}`,
      description,
      videoUrl: uploadDetails.secure_url,
    });
    console.log("Created SubSection:", SubSectionDetails);

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection");
    console.log("Updated Section:", updatedSection);

    return res.status(200).json({ success: true, data: updatedSection });
  } catch (error) {
    console.error("Error creating new sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update sub-section
exports.updateSubSection = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILES:", req.files);

    const { sectionId, subSectionId, title, description } = req.body;
    const subSection = await SubSection.findById(subSectionId);
    console.log("Fetched SubSection:", subSection);

    if (!subSection) {
      console.log("SubSection not found!");
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) subSection.title = title;
    if (description !== undefined) subSection.description = description;

    if (req.files?.video) {
      console.log("Updating video...");
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      console.log("Upload Details:", uploadDetails);
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeduration = `${uploadDetails.duration}`;
    }

    await subSection.save();
    console.log("Saved SubSection:", subSection);

    const updatedSection =
      await Section.findById(sectionId).populate("subSection");
    console.log("Updated Section:", updatedSection);

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error("Error updating sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
      error: error.message,
    });
  }
};

// Delete sub-section
exports.deleteSubSection = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);

    const { subSectionId, sectionId } = req.body;

    const sectionUpdateResult = await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSection: subSectionId } },
      { new: true }
    );
    console.log("Section after pull:", sectionUpdateResult);

    const subSection = await SubSection.findByIdAndDelete(subSectionId);
    console.log("Deleted SubSection:", subSection);

    if (!subSection) {
      console.log("SubSection not found for deletion!");
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    const updatedSection =
      await Section.findById(sectionId).populate("subSection");
    console.log("Updated Section after deletion:", updatedSection);

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error("Error deleting sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
      error: error.message,
    });
  }
};
