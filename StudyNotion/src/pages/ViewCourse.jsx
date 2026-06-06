import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice"

export default function ViewCourse() {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)

  // log render + props/state available
  console.log("ViewCourse render", { courseId, token, reviewModal })

  // wrapper that logs calls to setReviewModal
  const logSetReviewModal = useCallback(
    (val) => {
      console.log("setReviewModal called with:", val)
      setReviewModal(val)
    },
    [setReviewModal]
  )

  useEffect(() => {
    async function fetchCourseData() {
      console.log("fetchCourseData called for courseId:", courseId)
      try {
        const courseData = await getFullDetailsOfCourse(courseId, token)
        console.log("getFullDetailsOfCourse returned:", courseData)

        console.log("dispatching setCourseSectionData with:", courseData.courseDetails.courseContent)
        dispatch(setCourseSectionData(courseData.courseDetails.courseContent))

        console.log("dispatching setEntireCourseData with:", courseData.courseDetails)
        dispatch(setEntireCourseData(courseData.courseDetails))

        console.log("dispatching setCompletedLectures with:", courseData.completedVideos)
        dispatch(setCompletedLectures(courseData.completedVideos))

        let lectures = 0
        courseData?.courseDetails?.courseContent?.forEach((sec) => {
          console.log("iterating section:", sec)
          lectures += sec.subSection.length
        })
        console.log("total lectures computed:", lectures)
        dispatch(setTotalNoOfLectures(lectures))
      } catch (error) {
        console.error("fetchCourseData error:", error)
      }
    }

    console.log("ViewCourse useEffect mount")
    fetchCourseData()

    return () => {
      console.log("ViewCourse unmounted")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">
        <VideoDetailsSidebar setReviewModal={logSetReviewModal} />
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
          <div className="mx-6">
            <Outlet />
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={logSetReviewModal} />}
    </>
  )
}