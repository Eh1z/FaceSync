// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const mongoURI =
	"mongodb+srv://admin:website1122@freelance.kc2fzo9.mongodb.net/Attendance_DB?retryWrites=true&w=majority";

// Connect to MongoDB
const connectDB = async () => {
	try {
		await mongoose.connect(mongoURI);
		console.log("MongoDB connected");
	} catch (err) {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	}
};

connectDB();

// Handle connection events
mongoose.connection.on("connected", () =>
	console.log("Mongoose has connected to your DB")
);
mongoose.connection.on("error", (err) =>
	console.log("Mongoose connection error: " + err)
);
mongoose.connection.on("disconnected", () =>
	console.log("Mongoose disconnected")
);

process.on("SIGINT", async () => {
	await mongoose.connection.close();
	console.log("Mongoose disconnected on app termination");
	process.exit(0);
});

// Define Schemas
const userSchema = new mongoose.Schema(
	{
		name: String,
		email: String,
		mat_num: String,
		studentId: String,
		userImage: String,
		courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
		faceData: { type: Array, default: [] },
	},
	{ timestamps: true }
);

const attendanceSchema = new mongoose.Schema({
	course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
	name: { type: String },
	students: [
		{
			student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
			status: {
				type: String,
				enum: ["Present", "Absent"],
				default: "Absent",
			},
		},
	],
	createdAt: { type: Date, default: Date.now },
});

const lecturerSchema = new mongoose.Schema(
	{
		name: String,
		email: String,
		courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
	},
	{ timestamps: true }
);

const courseSchema = new mongoose.Schema(
	{
		courseName: String,
		courseCode: String,
		semester: String,
		level: String,
		lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer" },
	},
	{ timestamps: true }
);

// Define Models
const User = mongoose.model("User", userSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const Lecturer = mongoose.model("Lecturer", lecturerSchema);
const Course = mongoose.model("Course", courseSchema);

// Routes
app.get("/", (req, res) => res.json("Welcome to Face Sync Backend API"));

// User Routes
app.get("/users", async (req, res) => {
	try {
		const users = await User.find().populate("courses");
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch users" });
	}
});

app.post("/users", async (req, res) => {
	try {
		const {
			name,
			email,
			studentId,
			mat_num,
			userImage,
			courses,
			faceData,
		} = req.body;
		console.log("checking if face data is stored properly: ", faceData);
		const newUser = new User({
			name,
			email,
			studentId,
			mat_num,
			userImage,
			courses,
			faceData,
		});
		await newUser.save();
		res.status(201).json(newUser);
	} catch (error) {
		res.status(500).json({ message: "Failed to create user" });
	}
});

app.delete("/users/:id", async (req, res) => {
	try {
		const deletedUser = await User.findByIdAndDelete(req.params.id);
		if (!deletedUser)
			return res.status(404).json({ message: "User not found" });
		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete user" });
	}
});

// Update User Endpoint
app.put("/users/:id", async (req, res) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}
		res.json(updatedUser);
	} catch (error) {
		res.status(500).json({ message: "Failed to update user" });
	}
});

// Attendance Routes
app.post("/attendance", async (req, res) => {
	try {
		const { courseCode } = req.body;

		// Find the course based on the course code
		const course = await Course.findOne({ courseCode });

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Find all students enrolled in this course
		const students = await User.find({ courses: course._id });

		// Prepare the student list with default status 'Absent'
		const studentList = students.map((student) => ({
			student: student._id,
			status: "Absent",
		}));

		// 4Create new attendance record
		const newAttendance = new Attendance({
			course: course._id,
			name: course.courseCode,
			students: studentList,
		});

		// 5Save the attendance
		await newAttendance.save();

		res.status(201).json(newAttendance);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to create attendance" });
	}
});

app.get("/attendance", async (req, res) => {
	try {
		const { name, date } = req.query;

		let filter = {};

		// Filter by course name
		if (name) filter.course = name;

		// Filter by exact date (ignores time)
		if (date) {
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);
			filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
		}

		// Fetch attendance records
		const records = await Attendance.find({ name: name })
			.populate({
				path: "students.student", // This deeply populates the student field
				model: "User", // Your student model
			})
			.populate("course")
			.lean()
			.sort({ createdAt: "desc" })
			.limit(name || date ? undefined : 1);
		console.log(records);
		res.json(records);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch attendance records" });
	}
});

app.put("/attendance/:studentId", async (req, res) => {
	try {
		const updatedAttendance = await Attendance.findOneAndUpdate(
			{ userId: req.params.studentId },
			req.body,
			{ new: true }
		);
		res.json(updatedAttendance);
	} catch (error) {
		res.status(500).json({ message: "Failed to update attendance" });
	}
});

// Lecturer Routes
app.get("/lecturers", async (req, res) => {
	try {
		const lecturers = await Lecturer.find().populate("courses");
		res.json(lecturers);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch lecturers" });
	}
});

app.post("/lecturers", async (req, res) => {
	try {
		const { name, email, courses } = req.body;
		const newLecturer = new Lecturer({ name, email, courses });
		await newLecturer.save();
		res.status(201).json(newLecturer);
	} catch (error) {
		res.status(500).json({ message: "Failed to add lecturer" });
	}
});

app.put("/lecturers/:id", async (req, res) => {
	try {
		const updatedLecturer = await Lecturer.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.json(updatedLecturer);
	} catch (error) {
		res.status(500).json({ message: "Failed to update lecturer" });
	}
});

// Course Routes
app.get("/courses", async (req, res) => {
	const { level, semester } = req.query; // Get from query parameters

	try {
		// Filter based on level and semester, with case-insensitive matching
		const filter = {};

		if (level) filter.level = { $regex: new RegExp(level, "i") }; // Case-insensitive regex for level
		if (semester) filter.semester = { $regex: new RegExp(semester, "i") }; // Case-insensitive regex for semester

		// Fetch courses based on the filter, populated with lecturer data
		const courses = await Course.find(filter).populate("lecturer");

		// Send the filtered courses as the response
		res.json(courses);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch courses" });
	}
});

app.post("/courses", async (req, res) => {
	try {
		const { courseName, courseCode, level, semester, lecturer } = req.body;
		const newCourse = new Course({
			courseName,
			courseCode,
			level,
			semester,
			lecturer,
		});
		await newCourse.save();
		res.status(201).json(newCourse);
	} catch (error) {
		res.status(500).json({ message: "Failed to add course" });
	}
});

app.put("/courses/:id", async (req, res) => {
	try {
		const updatedCourse = await Course.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.json(updatedCourse);
	} catch (error) {
		res.status(500).json({ message: "Failed to update course" });
	}
});

//
//
//
//
//
// Admin Dashboard Endpoints

// 1. Get Total Students
app.get("/students", async (req, res) => {
	try {
		const studentsCount = await User.countDocuments();
		res.json({ totalStudents: studentsCount });
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch students count" });
	}
});

// 2. Get Total Attendance
app.get("/attendance-total", async (req, res) => {
	try {
		const totalAttendance = await Attendance.countDocuments();
		res.json({ totalAttendance });
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch attendance count" });
	}
});

// 3. Get Attendance/Student Ratio
app.get("/attendance-ratio", async (req, res) => {
	try {
		const totalStudents = await User.countDocuments();
		const totalAttendance = await Attendance.countDocuments();
		const ratio =
			totalStudents > 0
				? `${totalAttendance}` + "/" + `${totalStudents}`
				: 0;
		res.json({ ratio });
	} catch (error) {
		res.status(500).json({
			message: "Failed to calculate attendance ratio",
		});
	}
});

// 4. Get Recent Attendance Activity
app.get("/recent-activity", async (req, res) => {
	try {
		const records = await Attendance.find()
			.populate("userId")
			.sort({ createdAt: -1 })
			.limit(5); // Get the last 5 attendance logs
		res.json(records);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch recent activity" });
	}
});

// 5. Get Attendance Trends (monthly or weekly)
app.get("/attendance-trends", async (req, res) => {
	try {
		// Assuming we store dates in 'createdAt'
		const trends = await Attendance.aggregate([
			{
				$group: {
					_id: { $month: "$createdAt" }, // Group by month
					totalAttendance: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } }, // Sort by month
		]);
		res.json(trends);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch attendance trends" });
	}
});

// 6. Get Upcoming Courses
app.get("/upcoming-courses", async (req, res) => {
	try {
		const upcomingCourses = await Course.find()
			.populate("lecturer")
			.sort({ startDate: 1 }) // Assuming you have a startDate field
			.limit(5); // Show next 5 upcoming courses
		res.json(upcomingCourses);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch upcoming courses" });
	}
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
