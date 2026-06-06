require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

// Import models
const User = require("./modeles/user");
const Profile = require("./modeles/profile");
const Category = require("./modeles/category");
const Course = require("./modeles/course");
const Section = require("./modeles/section");
const Subsection = require("./modeles/subsection");
const CourseProgress = require("./modeles/courseProgress");
const RatingAndReview = require("./modeles/ratingandreviews");
const Tag = require("./modeles/tags");

// Sample videos
const sampleVideos = [
  "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
  "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4",
  "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4",
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL + "/test")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Generate a valid 10-digit number
const generatePhoneNumber = () => {
  let numStr = "";
  for (let i = 0; i < 10; i++) {
    numStr += faker.number.int({ min: 0, max: 9 }).toString();
  }
  return Number(numStr);
};

// Generate random boolean
const randomBoolean = () => faker.datatype.boolean();

async function createMassiveData({
  usersCount = 50,
  profilesCount = 50,
  categoriesCount = 10,
  tagsCount = 10,
  coursesCount = 50,
  sectionsCount = 100,
  subsectionsCount = 200,
} = {}) {
  // 1️⃣ Profiles
  const profiles = [];
  for (let i = 0; i < profilesCount; i++) {
    const profile = new Profile({
      gender: faker.person.sexType(), // Male / Female / Other
      dateofbirth: faker.date
        .past({ years: 30, refDate: new Date(2005, 0, 1) })
        .toISOString()
        .split("T")[0],
      about: faker.lorem.paragraph(),
      contactNumber: generatePhoneNumber(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
      socialLinks: {
        facebook: faker.internet.url(),
        twitter: faker.internet.url(),
        linkedin: faker.internet.url(),
      },
    });
    await profile.save();
    profiles.push(profile);
  }

  // 2️⃣ Users
  const users = [];
  for (let i = 0; i < usersCount; i++) {
    const user = new User({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: "password123",
      accountType: faker.helpers.arrayElement([
        "Admin",
        "Student",
        "Instructor",
      ]),
      image: `https://picsum.photos/seed/${faker.string.uuid()}/200/200`,
      additionalDetails: profiles[i % profiles.length]._id,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
    await user.save();
    users.push(user);
  }

  // 3️⃣ Categories
  const categories = [];
  for (let i = 0; i < categoriesCount; i++) {
    const category = new Category({
      name: faker.commerce.department(),
      description: faker.lorem.paragraph(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
    await category.save();
    categories.push(category);
  }

  // 4️⃣ Tags
  const tags = [];
  for (let i = 0; i < tagsCount; i++) {
    const tag = new Tag({
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
    await tag.save();
    tags.push(tag);
  }

  // 5️⃣ Subsections
  const subsections = [];
  for (let i = 0; i < subsectionsCount; i++) {
    const sub = new Subsection({
      title: faker.lorem.words(3),
      timeduration: `${faker.number.int({ min: 1, max: 60 })} mins`,
      description: faker.lorem.paragraph(),
      videourl: faker.helpers.arrayElement(sampleVideos),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
    await sub.save();
    subsections.push(sub);
  }

  // 6️⃣ Sections
  const sections = [];
  for (let i = 0; i < sectionsCount; i++) {
    const section = new Section({
      sectionName: faker.lorem.words(2),
      subsection: [
        subsections[i % subsections.length]._id,
        subsections[(i + 1) % subsections.length]._id,
      ],
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
    await section.save();
    sections.push(section);
  }

  // 7️⃣ Courses
  const courses = [];
  for (let i = 0; i < coursesCount; i++) {
    const course = new Course({
      courseName: faker.lorem.words(2),
      courseDescription: faker.lorem.paragraph(),
      instructor: users[i % users.length]._id,
      whatYouWillLearn: faker.lorem.sentences(3),
      courseContent: [
        sections[i % sections.length]._id,
        sections[(i + 1) % sections.length]._id,
      ],
      price: faker.commerce.price({ min: 100, max: 5000, dec: 0 }),
      thumbnail: `https://picsum.photos/seed/${faker.string.uuid()}/400/300`,
      Category: categories[i % categories.length]._id,
      tag: tags[i % tags.length]._id,
      studentsEnrolled: users.map((u) => u._id),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      isPublished: randomBoolean(),
    });
    await course.save();
    courses.push(course);
  }

  // 8️⃣ CourseProgress
  for (let user of users) {
    const progress = new CourseProgress({
      courseID: courses[0]._id,
      userID: user._id,
      completedVideos: subsections.slice(0, 3).map((s) => s._id),
      progressPercentage: faker.number.int({ min: 0, max: 100 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
    await progress.save();
    user.courseProgress.push(progress._id);
    await user.save();
  }

  // 9️⃣ Ratings & Reviews
  for (let i = 0; i < coursesCount; i++) {
    const review = new RatingAndReview({
      user: users[i % users.length]._id,
      course: courses[i % courses.length]._id,
      rating: faker.number.int({ min: 1, max: 5 }),
      review: faker.lorem.sentences(2),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
    await review.save();
  }

  console.log("All data seeded successfully!");
  process.exit();
}

// Run
createMassiveData({
  usersCount: 50,
  profilesCount: 50,
  categoriesCount: 10,
  tagsCount: 10,
  coursesCount: 30,
  sectionsCount: 60,
  subsectionsCount: 120,
});
