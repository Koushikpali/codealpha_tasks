import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { verifyStripePayment } from "../services/operations/studentFeaturesAPI";
import { setPaymentLoading } from "../slices/courseSlice";
function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const { paymentLoading } = useSelector((state) => state.course);

    // log on every render
    console.log("PaymentSuccess render", {
        locationSearch: location.search,
        token,
        paymentLoading,
    });

    useEffect(() => {
        console.log("PaymentSuccess useEffect start", { locationSearch: location.search });

        const query = new URLSearchParams(location.search);
        const sessionId = query.get("session_id");
        console.log("Parsed session_id from query:", sessionId);

        if (sessionId && token) {
            // Retrieve courses that were pending payment
            const courses = JSON.parse(localStorage.getItem("pendingCourses")) || [];
            console.log("Pending courses from localStorage:", courses);

            console.log("Dispatching setPaymentLoading(true)");
            dispatch(setPaymentLoading(true));

            verifyStripePayment(sessionId, courses, token, navigate, dispatch)
                .then((res) => {
                    console.log("verifyStripePayment resolved:", res);
                    localStorage.removeItem("pendingCourses");
                    console.log("Removed pendingCourses from localStorage");
                })
                .catch((err) => {
                    console.error("verifyStripePayment rejected:", err);
                    toast.error("Payment verification failed.");
                    console.log("Navigating to /dashboard/cart");
                    navigate("/dashboard/cart");
                });
        } else {
            console.error("Invalid payment session or missing token", { sessionId, token });
            toast.error("Invalid payment session.");
            console.log("Navigating to /");
            navigate("/");
        }
    }, [location.search, token, navigate, dispatch]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
            {paymentLoading ? (
                <div className="text-xl font-semibold">Verifying your payment...</div>
            ) : (
                <div className="text-xl font-semibold">Processing completed!</div>
            )}
        </div>
    );
}

export default PaymentSuccess;
