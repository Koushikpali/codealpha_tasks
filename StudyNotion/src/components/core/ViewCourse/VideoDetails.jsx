import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { BigPlayButton, Player } from "video-react";
import "video-react/dist/video-react.css";

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import IconBtn from "../../common/IconBtn";

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef(null);
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse);

  const [videoData, setVideoData] = useState(null);
  const [previewSource, setPreviewSource] = useState("");
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("✅ useEffect triggered with:");
    console.log("courseSectionData:", courseSectionData);
    console.log("courseEntireData:", courseEntireData);
    console.log("location:", location.pathname);

    if (!courseSectionData?.length) {
      console.log("⏳ No courseSectionData yet, returning early.");
      return;
    }

    if (!courseId || !sectionId || !subSectionId) {
      console.warn("⚠️ Missing params, navigating back.");
      navigate(`/dashboard/enrolled-courses`);
      return;
    }

    const filteredData = courseSectionData.filter(
      (course) => course._id === sectionId
    );
    console.log("🎯 Filtered section:", filteredData);

    const filteredVideoData = filteredData?.[0]?.subSection.filter(
      (data) => data._id === subSectionId
    );
    console.log("🎬 Filtered subSection:", filteredVideoData);

    if (filteredVideoData?.length) {
      setVideoData(filteredVideoData[0]);
      console.log("✅ Video data set:", filteredVideoData[0]);
    } else {
      console.warn("⚠️ No video data found for this subsection ID.");
    }

    setPreviewSource(courseEntireData?.thumbnail || "");
    setVideoEnded(false);
  }, [courseSectionData, courseEntireData, location.pathname]);

  const handleLectureCompletion = async () => {
    setLoading(true);
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subSectionId },
      token
    );
    if (res) {
      dispatch(updateCompletedLectures(subSectionId));
    }
    setLoading(false);
  };
const videoUrl = videoData?.videoUrl || videoData?.videourl;


  console.log("🎥 Rendering component with:");
  console.log("videoData:", videoData);
  console.log("videoUrl:", videoData?.videoUrl);
  console.log("completedLectures:", completedLectures);

  return (
    <div className="flex flex-col gap-5 text-white">
      {!videoData ? (
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <Player
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          onEnded={() => setVideoEnded(true)}
          src={
            videoData?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4" // fallback test video
          }
        >
          <BigPlayButton position="center" />
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className="absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {!completedLectures?.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onClick={handleLectureCompletion}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              <IconBtn
                disabled={loading}
                onClick={() => {
                  if (playerRef?.current) {
                    playerRef.current.seek(0);
                    setVideoEnded(false);
                  }
                }}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />
            </div>
          )}
        </Player>
      )}

      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pt-2 pb-6">{videoData?.description}</p>
    </div>
  );
};

export default VideoDetails;
