import { useEffect, useState } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState(null);

  // ✅ Function to get enrolled courses
  const getEnrolledCourses = async () => {
    if (!token) {
      console.warn(
        "⚠️ [Frontend] No token found — cannot fetch enrolled courses"
      );
      return;
    }

    console.log("📡 [Frontend] Calling getUserEnrolledCourses API...");

    try {
      const res = await getUserEnrolledCourses(token);
      console.log("✅ [Frontend] Raw API Response:", res);
      console.log("✅ [Frontend] typeof res:", typeof res);

      // ✅ Handle both direct array or nested data format
      const courses = Array.isArray(res)
        ? res
        : res?.data?.data || res?.data || [];

      console.log("🎯 [Frontend] Parsed Enrolled Courses:", courses);
      setEnrolledCourses(courses);
    } catch (error) {
      console.error("💥 [Frontend] Could not fetch enrolled courses:", error);
      setEnrolledCourses([]);
    }
  };

  // ✅ Fetch when token is available
  useEffect(() => {
    if (token) {
      console.log("🚀 [Frontend] useEffect triggered with token:", token);
      getEnrolledCourses();
    }
  }, [token]);

  console.log("🔄 [Render] enrolledCourses State:", enrolledCourses);

  return (
    <>
      <div className="text-3xl text-richblack-50">Enrolled Courses</div>

      {!enrolledCourses ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !enrolledCourses.length ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          📭 You have not enrolled in any course yet.
        </p>
      ) : (
        <div className="my-8 text-richblack-5">
          {/* Headings */}
          <div className="flex rounded-t-lg bg-richblack-500 ">
            <p className="w-[45%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>

          {/* List of Courses */}
          {enrolledCourses.map((course, i, arr) => (
            <div
              className={`flex items-center border border-richblack-700 ${
                i === arr.length - 1 ? "rounded-b-lg" : ""
              }`}
              key={course?._id || i}
            >
              <div
                className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                onClick={() => {
                  console.log("🎬 Navigating to course:", course);
                  navigate(
                    `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                  );
                }}
              >
                <img
                  src={course.thumbnail}
                  alt="course_img"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="font-semibold">{course.courseName}</p>
                  <p className="text-xs text-richblack-300">
                    {course.courseDescription?.length > 50
                      ? `${course.courseDescription.slice(0, 50)}...`
                      : course.courseDescription}
                  </p>
                </div>
              </div>

              <div className="w-1/4 px-2 py-3">
                {course?.totalDuration || "N/A"}
              </div>

              <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                <p>Progress: {course.progressPercentage || 0}%</p>
                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="8px"
                  isLabelVisible={false}
                />
              </div>

              <div className="w-[5%] flex justify-center">
                <BiDotsVerticalRounded className="text-lg" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
