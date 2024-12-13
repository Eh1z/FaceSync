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
		process.exit(1); // Exit process with failure
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

// Gracefully close connection on app termination
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
		faceData: Array, // Store facial landmarks or embeddings
	},
	{ timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true }
);

// Define Models
const User = mongoose.model("User", userSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

// Routes
// Get all users
app.get("/users", async (req, res) => {
	const users = await User.find();
	res.json(users);
});

// Add a new user
app.post("/users", async (req, res) => {
	const { name, email, faceData } = req.body;
	const newUser = new User({ name, email, faceData });
	await newUser.save();
	res.json(newUser);
});

// Mark attendance
app.post("/attendance", async (req, res) => {
	const { userId } = req.body;
	const newAttendance = new Attendance({ userId });
	await newAttendance.save();
	res.json(newAttendance);
});

// Get attendance records
app.get("/attendance", async (req, res) => {
	const records = await Attendance.find()
		.populate("userId")
		.sort({ createdAt: "desc" });
	res.json(records);
	console.log("====>", records);
});

// Start Server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
