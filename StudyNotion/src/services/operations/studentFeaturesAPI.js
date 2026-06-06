import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints;

/* -------------------------------------------------------------------------- */
/* 🟢 1. Create Stripe Checkout Session (Start Payment)                       */
/* -------------------------------------------------------------------------- */
export async function buyCourse(
  token,
  courses,
  userDetails,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Creating Stripe session...");
  dispatch(setPaymentLoading(true));

  try {
    const cleanToken = token?.replace(/^"|"$/g, "");
    const headers = { Authorization: `Bearer ${cleanToken}` };
    const payload = { courses };

    const sessionResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      payload,
      headers
    );

    if (!sessionResponse?.data?.success) {
      throw new Error(sessionResponse?.data?.message || "Payment API error");
    }

    const { url } = sessionResponse.data;

    // ✅ Save courses so we can verify later even if Redux resets
    localStorage.setItem("pendingCourses", JSON.stringify(courses));

    // ✅ Redirect to Stripe Checkout
    window.location.href = url;
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    toast.error("Could not initiate payment");
    dispatch(setPaymentLoading(false));
  } finally {
    toast.dismiss(toastId);
  }
}

/* -------------------------------------------------------------------------- */
/* 🟢 2. Verify Payment After Returning from Stripe                           */
/* -------------------------------------------------------------------------- */
export async function verifyStripePayment(
  sessionId,
  courses,
  token,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Verifying payment...");
  dispatch(setPaymentLoading(true));

  try {
    const cleanToken = token?.replace(/^"|"$/g, "");
    const storedCourses = JSON.parse(
      localStorage.getItem("pendingCourses") || "[]"
    );
    const finalCourses = courses?.length ? courses : storedCourses;

    const payload = { sessionId, courses: finalCourses };
    const headers = { Authorization: `Bearer ${cleanToken}` };

    const response = await apiConnector(
      "POST",
      COURSE_VERIFY_API,
      payload,
      headers
    );

    if (!response?.data?.success)
      throw new Error(response?.data?.message || "Verification failed");

    toast.success("Payment successful! You are enrolled in the course.");
    dispatch(resetCart());
    localStorage.removeItem("pendingCourses");

    navigate("/dashboard/enrolled-courses");
  } catch (error) {
    console.error("Stripe verification error:", error);
    toast.error("Payment verification failed");
  } finally {
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
  }
}

/* -------------------------------------------------------------------------- */
/* 🟢 3. Send Payment Success Email (Optional Manual Trigger)                 */
/* -------------------------------------------------------------------------- */
export async function sendStripePaymentEmail(sessionId, token) {
  console.log("sendStripePaymentEmail called with:", { sessionId, token });

  try {
    const cleanToken = token?.replace(/^"|"$/g, "");
    const payload = { orderId: sessionId };
    const headers = { Authorization: `Bearer ${cleanToken}` };

    const resp = await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      payload,
      headers
    );

    console.log("Payment success email sent:", resp);
  } catch (error) {
    console.error(
      "Payment email error:",
      error,
      "response:",
      error?.response?.data
    );
  }
}
