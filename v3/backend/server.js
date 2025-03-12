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
mongoose.connection.on("connected", () => {
	console.log("Mongoose has connected to your DB");
});
mongoose.connection.on("error", (err) => {
	console.log("Mongoose connection error: " + err);
});
mongoose.connection.on("disconnected", () => {
	console.log("Mongoose disconnected");
});
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
	},
	{ timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
	},
	{ timestamps: true }
);

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
		level: Number,
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
app.get("/", (req, res) => {
	res.json("Welcome to Face Sync Backend API");
});

// Users
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
		const { name, email, studentId, mat_num, faceData, courses } = req.body;
		const newUser = new User({
			name,
			email,
			studentId,
			mat_num,
			faceData,
			courses,
		});
		await newUser.save();
		res.status(201).json(newUser);
	} catch (error) {
		res.status(500).json({ message: "Failed to create user" });
	}
});

// Attendance
app.post("/attendance", async (req, res) => {
	try {
		const { userId, courseId } = req.body;
		const newAttendance = new Attendance({ userId, courseId });
		await newAttendance.save();
		res.status(201).json(newAttendance);
	} catch (error) {
		res.status(500).json({ message: "Failed to mark attendance" });
	}
});

app.get("/attendance", async (req, res) => {
	try {
		const records = await Attendance.find()
			.populate("userId")
			.populate("courseId")
			.sort({ createdAt: "desc" });
		res.json(records);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch attendance records" });
	}
});

// Lecturers
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
		const { name, email, courses } = req.body;
		// Use exec() to ensure the query executes correctly when chaining populate
		const updatedLecturer = await Lecturer.findByIdAndUpdate(
			req.params.id,
			{ name, email, courses },
			{ new: true }
		)
			.populate("courses")
			.exec();
		if (!updatedLecturer) {
			return res.status(404).json({ message: "Lecturer not found" });
		}
		res.json(updatedLecturer);
	} catch (error) {
		console.error("Update Lecturer Error:", error); // Log detailed error info
		res.status(500).json({
			message: "Failed to update lecturer",
			error: error.message,
		});
	}
});

// Courses
app.get("/courses", async (req, res) => {
	try {
		const courses = await Course.find().populate("lecturer");
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
// Update course route
app.put("/courses/:id", async (req, res) => {
	try {
		const { courseName, courseCode, level, semester, lecturer } = req.body;
		const updatedCourse = await Course.findByIdAndUpdate(
			req.params.id,
			{ courseName, courseCode, level, semester, lecturer },
			{ new: true } // This ensures the updated document is returned
		).populate("lecturer");

		if (!updatedCourse) {
			return res.status(404).json({ message: "Course not found" });
		}
		res.json(updatedCourse); // Return the updated course
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
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
