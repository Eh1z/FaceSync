// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const mongoURI =
	"mongodb+srv://admin:website1122@freelance.kc2fzo9.mongodb.net/Conference_DB?retryWrites=true&w=majority";

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

// Speaker Schema
const speakerSchema = new mongoose.Schema(
	{
		name: String,
		email: String,
		bio: String,
		photo: String, // URL to speaker's photo
	},
	{ timestamps: true }
);

// Session Schema
const sessionSchema = new mongoose.Schema(
	{
		title: String,
		description: String,
		time: Date, // When the session is happening
		speaker: { type: mongoose.Schema.Types.ObjectId, ref: "Speaker" },
	},
	{ timestamps: true }
);

// Attendee Schema
const attendeeSchema = new mongoose.Schema(
	{
		name: String,
		email: String,
		job: String, // Attendee's job/role
		phone: String,
		age: Number,
		photo: String, // URL to attendee's photo
		session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" }, // Which session the attendee is attending

		faceData: { type: [Number], default: [] }, // Store face data as an array of numbers
	},
	{ timestamps: true }
);

// Define Models
const Speaker = mongoose.model("Speaker", speakerSchema);
const Session = mongoose.model("Session", sessionSchema);
const Attendee = mongoose.model("Attendee", attendeeSchema);

// Routes
app.get("/", (req, res) => res.json("Welcome to Face Sync Backend API"));

// Speaker Routes
app.get("/speakers", async (req, res) => {
	try {
		const speakers = await Speaker.find();
		res.json(speakers);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch speakers" });
	}
});

app.post("/speakers", async (req, res) => {
	try {
		const { name, email, bio, photo } = req.body;
		const newSpeaker = new Speaker({ name, email, bio, photo });
		await newSpeaker.save();
		res.status(201).json(newSpeaker);
	} catch (error) {
		res.status(500).json({ message: "Failed to add speaker" });
	}
});

app.put("/speakers/:id", async (req, res) => {
	try {
		const updatedSpeaker = await Speaker.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.json(updatedSpeaker);
	} catch (error) {
		res.status(500).json({ message: "Failed to update speaker" });
	}
});

// Session Routes
app.get("/sessions", async (req, res) => {
	try {
		const sessions = await Session.find().populate("speaker");
		res.json(sessions);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch sessions" });
	}
});

app.post("/sessions", async (req, res) => {
	try {
		const { title, description, time, speaker } = req.body;
		const newSession = new Session({ title, description, time, speaker });
		await newSession.save();
		res.status(201).json(newSession);
	} catch (error) {
		res.status(500).json({ message: "Failed to create session" });
	}
});

app.put("/sessions/:id", async (req, res) => {
	try {
		const updatedSession = await Session.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.json(updatedSession);
	} catch (error) {
		res.status(500).json({ message: "Failed to update session" });
	}
});

// Attendee Routes
app.get("/attendees", async (req, res) => {
	try {
		const attendees = await Attendee.find().populate("session");
		res.json(attendees);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch attendees" });
	}
});

app.post("/attendees", async (req, res) => {
	try {
		const { name, email, job, phone, age, photo, session, faceData } =
			req.body;
		const newAttendee = new Attendee({
			name,
			email,
			job,
			phone,
			age,
			photo,
			session,
			faceData, // Store the face data
		});
		await newAttendee.save();
		res.status(201).json(newAttendee);
	} catch (error) {
		res.status(500).json({ message: "Failed to add attendee" });
	}
});

// Update Attendee Endpoint
app.put("/attendees/:id", async (req, res) => {
	try {
		const updatedAttendee = await Attendee.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		if (!updatedAttendee) {
			return res.status(404).json({ message: "Attendee not found" });
		}
		res.json(updatedAttendee);
	} catch (error) {
		res.status(500).json({ message: "Failed to update attendee" });
	}
});

// Delete Attendee Endpoint
app.delete("/attendees/:id", async (req, res) => {
	try {
		const deletedAttendee = await Attendee.findByIdAndDelete(req.params.id);
		if (!deletedAttendee) {
			return res.status(404).json({ message: "Attendee not found" });
		}
		res.status(200).json({ message: "Attendee deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete attendee" });
	}
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
