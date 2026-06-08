const mongoose = require("mongoose");
const Course = require("../modeles/course");
const User = require("../modeles/user");
const CourseProgress = require("../modeles/courseProgress");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/courseEnrollmenrEmail");
const { paymentSuccessEmail } = require("../mail/paymentSuccessEmail");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/* =========================================================
   1️⃣ CREATE CHECKOUT SESSION (Frontend)
========================================================= */
exports.createCheckoutSession = async (req, res) => {
  try {
    // console.log("[Checkout] Request body:", req.body);
    const courses = req.body.courses; 
     const courseId = courses[0];
    const userId = req.user.id;
    // console.log("[Checkout] UserId:", userId, "CourseId:", courseId);

    if (!courseId) {
      console.log("[Checkout] CourseId missing!");
      return res
        .status(400)
        .json({ success: false, message: "CourseId missing" });
    }

    const course = await Course.findById(courseId);
    // console.log("[Checkout] Fetched course from DB:", course);

    if (!course) {
      console.log("[Checkout] Course not found for ID:", courseId);
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const CLIENT_URL = process.env.CLIENT_URL;
    console.log("[Checkout] CLIENT_URL:", CLIENT_URL);

    if (!CLIENT_URL) {
      console.log("[Checkout] CLIENT_URL not configured in env");
      return res
        .status(500)
        .json({ success: false, message: "CLIENT_URL not configured" });
    }

    const session = await stripe.checkout.sessions.create({
      locale: "en",
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseName,
              description: course.courseDescription,
            },
            unit_amount: course.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: { courseId, userId },
      success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/payment/cancel`,
    });

    console.log("[Checkout] Stripe session created:", session.id, session.url);

    res.status(200).json({
      success: true,
      message: "Checkout session created successfully",
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("[Checkout] Error creating session:", error);
    res.status(500).json({
      success: false,
      message: "Error creating checkout session",
      error: error.message,
    });
  }
};
exports.verifySession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing session ID" });
    }

    // Retrieve session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const userId = session.metadata.userId;
      const courseId = session.metadata.courseId;

      // Enroll the student manually
      await enrollStudents([courseId], userId);

      // Send success email
      await sendPaymentSuccessEmailHelper(
        userId,
        session.id,
        session.payment_intent,
        session.amount_total
      );

      return res
        .status(200)
        .json({
          success: true,
          message: "Payment verified and course enrolled",
        });
    }

    res
      .status(400)
      .json({ success: false, message: "Payment not completed yet" });
  } catch (err) {
    console.error("[VerifySession] Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error verifying session" });
  }
};


/* =========================================================
   2️⃣ STRIPE WEBHOOK: VERIFY PAYMENT
   ⚠️ Use express.raw() for body parsing in route
========================================================= */
exports.verifyPayment = async (req, res) => {
  console.log("[Webhook] Incoming request:", req.body);
  const sig = req.headers["stripe-signature"];
  console.log("[Webhook] Stripe signature:", sig);

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("[Webhook] Event constructed:", event.type);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("[Webhook] Checkout completed session:", session);

    const { courseId, userId } = session.metadata;
    console.log("[Webhook] Metadata received:", { courseId, userId });

    try {
      // ✅ Enroll student in the course(s)
      await enrollStudents([courseId], userId);
      console.log("[Webhook] Enrollment completed for user:", userId);

      // ✅ Send confirmation email
      await sendPaymentSuccessEmailHelper(
        userId,
        session.id,
        session.payment_intent,
        session.amount_total
      );
      console.log("[Webhook] Payment success email sent");

      return res
        .status(200)
        .json({
          success: true,
          message: "Payment Verified and Enrollment Done",
        });
    } catch (err) {
      console.error("[Webhook] Enrollment or email failed:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Ignore other events
  console.log("[Webhook] Event ignored:", event.type);
  res.status(200).json({ success: true, message: "Event received" });
};

/* =========================================================
   3️⃣ SEND PAYMENT SUCCESS EMAIL (Manual Endpoint)
========================================================= */
exports.sendPaymentSuccessEmail = async (req, res) => {
  console.log("[Email] Request body:", req.body);
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;
  console.log("[Email] UserId:", userId);

  if (!orderId || !paymentId || !amount || !userId) {
    console.log("[Email] Missing required fields");
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    await sendPaymentSuccessEmailHelper(userId, orderId, paymentId, amount);
    console.log("[Email] Payment success email sent to user:", userId);
    return res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not send email" });
  }
};

/* =========================================================
   4️⃣ HELPER: ENROLL STUDENTS
========================================================= */
const enrollStudents = async (courses, userId) => {
  if (!courses || !userId) {
    throw new Error("Please provide Course ID and User ID");
  }

  for (const courseId of courses) {
    // ✅ Enroll student in the course
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $addToSet: { studentsEnroled: userId } }, // prevents duplicate entries
      { new: true }
    );

    if (!enrolledCourse) {
      throw new Error(`Course not found: ${courseId}`);
    }

    console.log("[Enroll] Updated course:", enrolledCourse._id);

    // ✅ Create course progress record
    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId: userId,
      completedVideos: [],
    });

    // ✅ Add course + progress to student
    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    );

    if (!enrolledStudent) {
      throw new Error(`User not found: ${userId}`);
    }

    console.log("[Enroll] Enrolled student:", enrolledStudent._id);
  }

  return true;
};


/* =========================================================
   5️⃣ HELPER: PAYMENT SUCCESS EMAIL
========================================================= */
const sendPaymentSuccessEmailHelper = async (
  userId,
  orderId,
  paymentId,
  amount
) => {
  console.log("[EmailHelper] Sending email for user:", userId, {
    orderId,
    paymentId,
    amount,
  });
  const user = await User.findById(userId);
  console.log("[EmailHelper] Fetched user:", user);
  if (!user) throw new Error("User not found");

  await mailSender(
    user.email,
    "Payment Received",
    paymentSuccessEmail(
      `${user.firstName} ${user.lastName}`,
      amount / 100,
      orderId,
      paymentId
    )
  );
  console.log("[EmailHelper] Payment email sent to:", user.email);
};
