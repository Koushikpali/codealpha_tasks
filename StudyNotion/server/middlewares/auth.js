 // Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../modeles/user");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests


exports.auth = async (req, res, next) => {
  try {
    console.log("========== AUTH MIDDLEWARE START ==========");
    console.log("Incoming Request Path:", req.path);
    console.log("Incoming Method:", req.method);
    console.log("Header Authorization:", req.header("Authorization"));
    console.log("Cookie Token:", req.cookies?.token);
    console.log("Body Token:", req.body?.token);

    // Extract token from header, cookies, or body
    let token =
      req.cookies?.token ||
      req.body?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Remove any surrounding quotes if present
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    console.log("Extracted Token:", token);

    if (!token) {
      console.log("❌ No token found.");
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWDSECRETKEY);
      console.log("✅ Token verified successfully!");
      console.log("Decoded Token:", decoded);
      req.user = decoded;
      next();
    } catch (err) {
      console.log("❌ Token verification failed:", err.message);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    console.log("========== AUTH MIDDLEWARE END ==========");
  } catch (err) {
    console.log("⚠️ Auth middleware error:", err.message);
    return res.status(500).json({ success: false, message: "Auth middleware failed" });
  }
};

exports.isStudent = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isInstructor = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });
		console.log(userDetails);

		console.log(userDetails.accountType);

		if (userDetails.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};