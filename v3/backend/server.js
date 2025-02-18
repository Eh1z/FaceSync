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

// Connection events
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

// DataBase Schemas
const userSchema = new mongoose.Schema(
	{
		name: String,
		email: String,
		userImage: String,
		// Students select their courses during registration
		courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
	},
	{ timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		// Attendance records include the selected course
		courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
	},
	{ timestamps: true }
);

const lecturerSchema = new mongoose.Schema(
	{
		name: String,
		email: String,
		// A lecturer can be assigned multiple courses
		courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
	},
	{ timestamps: true }
);

const courseSchema = new mongoose.Schema(
	{
		courseName: String,
		courseCode: String,
		// Each course can be assigned a lecturer
		lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer" },
	},
	{ timestamps: true }
);

// Models
const User = mongoose.model("User", userSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const Lecturer = mongoose.model("Lecturer", lecturerSchema);
const Course = mongoose.model("Course", courseSchema);

// API Routes

// Users
app.get("/users", async (req, res) => {
	const users = await User.find().populate("courses");
	res.json(users);
});

app.post("/users", async (req, res) => {
	try {
		const { name, email, userImage, courses } = req.body;
		const user = new User({ name, email, userImage, courses });
		await user.save();
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to register user" });
	}
});

// Attendance
app.post("/attendance", async (req, res) => {
	try {
		const { userId, courseId } = req.body;
		const newAttendance = new Attendance({ userId, courseId });
		await newAttendance.save();
		res.json(newAttendance);
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
		const lecturer = new Lecturer({ name, email, courses });
		await lecturer.save();
		res.status(201).json({
			message: "Lecturer added successfully",
			lecturer,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to add lecturer" });
	}
});

// Optionally, assign a course to an existing lecturer
app.put("/lecturers/:id/add-course", async (req, res) => {
	try {
		const { courseId } = req.body;
		const lecturer = await Lecturer.findById(req.params.id);
		if (!lecturer)
			return res.status(404).json({ message: "Lecturer not found" });
		lecturer.courses.push(courseId);
		await lecturer.save();
		res.json({ message: "Course assigned to lecturer", lecturer });
	} catch (error) {
		res.status(500).json({ message: "Failed to assign course" });
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
		const { courseName, courseCode, lecturer } = req.body;
		const course = new Course({ courseName, courseCode, lecturer });
		await course.save();
		res.status(201).json({ message: "Course added successfully", course });
	} catch (error) {
		res.status(500).json({ message: "Failed to add course" });
	}
});

// Start Server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
