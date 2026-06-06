const mailsender = require("../utils/mailSender");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../modeles/user"); // DO NOT rename this further

// ===================================================================
//  SEND RESET PASSWORD LINK
// ===================================================================
exports.resetPasswordToken = async (req, res) => {
  console.log("\n🔥 [API HIT] resetPasswordToken");

  try {
    const { email } = req.body;
    console.log("📩 Received email:", email);

    if (!email) {
      console.log("❌ No email provided");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    console.log("🔍 DB user lookup:", user);

    if (!user) {
      console.log("❌ Email not found");
      return res.status(404).json({
        success: false,
        message: "Email not registered",
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString("hex");
    console.log("🔑 Generated token:", token);

    // Store reset token in DB
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        token,
        resetPasswordExpires: Date.now() + 3600000, // 1 hour
      },
      { new: true }
    );

    console.log("📝 Updated user with token:", updatedUser);

    // Generate password reset link
    const link = `http://localhost:3000/update-password/${token}`;
    console.log("🔗 Reset link:", link);

    // Send email
    try {
      console.log("📨 Sending reset email...");
      await mailsender(
        email,
        "Password Reset",
        `Your password reset link: ${link}`
      );
      console.log("✅ Email sent successfully");
    } catch (err) {
      console.log("🔥 Error during email sending:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email",
        error: err.message,
      });
    }

    // Final response
    return res.status(200).json({
      success: true,
      message: "Reset email sent. Check your inbox.",
    });
  } catch (error) {
    console.log("💥 Server error in resetPasswordToken:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ===================================================================
//  RESET PASSWORD (AFTER USER CLICKS LINK)
// ===================================================================
exports.resetPassword = async (req, res) => {
  console.log("\n🔥 [API HIT] resetPassword");

  try {
    const { password, confirmPassword, token } = req.body;

    console.log("📩 Incoming:", {
      password,
      confirmPassword,
      token,
    });

    if (!password || !confirmPassword || !token) {
      console.log("❌ Missing fields");
      return res.status(400).json({
        success: false,
        message: "Password, confirmPassword, and token required",
      });
    }

    if (password !== confirmPassword) {
      console.log("❌ Password mismatch");
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Find user with this token
    const userDetails = await User.findOne({ token });
    console.log("🔍 Token lookup:", userDetails);

    if (!userDetails) {
      console.log("❌ Invalid token");
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Check expiry
    if (userDetails.resetPasswordExpires < Date.now()) {
      console.log("⏳ Token expired");
      return res.status(403).json({
        success: false,
        message: "Reset token expired. Request a new one.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 New hashed password:", hashedPassword);

    // Update user password
    await User.findOneAndUpdate(
      { token },
      {
        password: hashedPassword,
        token: null,
        resetPasswordExpires: null,
      }
    );

    console.log("✅ Password updated successfully");

    return res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log("💥 Server error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};
