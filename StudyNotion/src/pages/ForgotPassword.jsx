import { useState, useEffect } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { getPasswordResetToken } from "../services/operations/authAPI";

function ForgotPassword() {
  console.log("🔄 Component Rendered: ForgotPassword");

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  console.log("📌 Current State =>", { email, emailSent, loading });

  // Track changes in email
  useEffect(() => {
    console.log("✏️ Email updated:", email);
  }, [email]);

  // Track if emailSent flips
  useEffect(() => {
    console.log("📨 emailSent changed:", emailSent);
  }, [emailSent]);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    console.log("🚀 Form submitted with email:", email);

    if (!email || email.trim() === "") {
      console.log("❌ Attempted submit with empty email!");
      return;
    }

    console.log("📬 Dispatching getPasswordResetToken with email:", email);

    dispatch(getPasswordResetToken(email, setEmailSent))
      .then(() => {
        console.log("✅ Password reset request dispatched successfully.");
      })
      .catch((err) => {
        console.log("🔥 Error dispatching reset token request:", err);
      });
  };

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      {loading ? (
        <>
          {console.log("⏳ Loading spinner showing")}
          <div className="spinner"></div>
        </>
      ) : (
        <>
          {console.log("📄 Rendering password reset form")}
          <div className="max-w-[500px] p-4 lg:p-8">
            <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5">
              {!emailSent ? "Reset your password" : "Check email"}
            </h1>

            <p className="my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100">
              {!emailSent
                ? "Have no fear. We'll email you instructions to reset your password. If you dont have access to your email we can try account recovery"
                : `We have sent the reset email to ${email}`}
            </p>

            <form onSubmit={handleOnSubmit}>
              {!emailSent && (
                <label className="w-full">
                  <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                    Email Address <sup className="text-pink-200">*</sup>
                  </p>

                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      console.log("⌨️ typing:", e.target.value);
                      setEmail(e.target.value);
                    }}
                    placeholder="Enter email address"
                    className="form-style w-full"
                  />
                </label>
              )}

              <button
                type="submit"
                className="mt-6 w-full rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900"
                onClick={() => console.log("👆 Submit button clicked")}
              >
                {!emailSent ? "Submit" : "Resend Email"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <Link
                to="/login"
                onClick={() => console.log("⬅️ Navigating back to login")}
              >
                <p className="flex items-center gap-x-2 text-richblack-5">
                  <BiArrowBack /> Back To Login
                </p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ForgotPassword;
