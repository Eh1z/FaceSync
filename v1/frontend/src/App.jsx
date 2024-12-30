// src/App.jsx
import React, { useState, useEffect } from "react";
import Register from "./components/Register";
import CheckIn from "./components/CheckIn";
import ExportDropdown from "./components/ExportDropDown";
import { getUsers, getAttendance, addUser } from "./api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
	normalizeLandmarks,
	calculateCosineSimilarity,
} from "./utils/faceRecognition";

const App = () => {
	// State variables
	const [knownFaces, setKnownFaces] = useState([]);
	const [attendance, setAttendance] = useState([]);
	const [currentView, setCurrentView] = useState("home"); // Possible values: 'home', 'register', 'checkin'

	// Function to fetch all users
	const fetchUsers = async () => {
		try {
			const response = await getUsers();
			setKnownFaces(response.data);
		} catch (err) {
			console.error("Error fetching users:", err);
			toast.error("Failed to fetch users.");
		}
	};

	// Function to fetch all attendance records
	const fetchAttendance = async () => {
		try {
			const response = await getAttendance();
			setAttendance(response.data);
		} catch (err) {
			console.error("Error fetching attendance records:", err);
			toast.error("Failed to fetch attendance records.");
		}
	};

	// Fetch users and attendance records on component mount
	useEffect(() => {
		fetchUsers();
		fetchAttendance();
	}, []);

	// Function to handle adding a new user
	const handleAddUser = async (user) => {
		try {
			// Normalize user landmarks before sending to backend
			const normalizedLandmarks = normalizeLandmarks(user.faceData);
			const updatedUser = { ...user, faceData: normalizedLandmarks };

			await addUser(updatedUser);
			toast.success("User registered successfully!");
			fetchUsers(); // Refresh knownFaces after adding a user
			setCurrentView("home"); // Navigate back to home after registration
		} catch (error) {
			console.error("Error adding user:", error);
			toast.error("Failed to register user.");
		}
	};

	// Function to handle marking attendance
	const handleMarkAttendance = async () => {
		try {
			// This function can be used to perform additional actions after marking attendance
			fetchAttendance(); // Refresh attendance records after marking
		} catch (error) {
			console.error("Error marking attendance:", error);
			toast.error("Failed to mark attendance.");
		}
	};

	// Navigation functions
	const navigateToRegister = () => {
		setCurrentView("register");
	};

	const navigateToCheckIn = () => {
		setCurrentView("checkin");
	};

	const navigateToHome = () => {
		setCurrentView("home");
	};

	return (
		<div className="min-h-screen bg-gray-100 p-4">
			{/* Header */}
			<header className="flex justify-center items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-800">
					Facial Recognition Attendance
				</h1>
			</header>

			{/* Main Content */}
			<main className="flex flex-col items-center space-y-6">
				{/* Conditional Rendering Based on Current View */}
				{currentView === "home" && (
					<div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mx-auto">
						<h2 className="text-xl font-semibold mb-4 text-gray-700">
							Welcome!
						</h2>
						<div className="space-y-4">
							<button
								onClick={navigateToRegister}
								className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
							>
								Register New User
							</button>
							<button
								onClick={navigateToCheckIn}
								className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
							>
								Mark Attendance
							</button>
						</div>
					</div>
				)}

				{currentView === "register" && (
					<Register
						onAddUser={handleAddUser}
						onCancel={navigateToHome}
					/>
				)}

				{currentView === "checkin" && (
					<CheckIn
						onMarkAttendance={handleMarkAttendance}
						onCancel={navigateToHome}
					/>
				)}

				{/* Attendance List */}
				<section className="w-full max-w-2xl mt-8">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-semibold text-gray-700">
							Attendance List
						</h2>
						{/* Export Dropdown */}
						<ExportDropdown data={attendance} />
					</div>
					<div className="bg-white shadow rounded-lg p-4">
						{attendance.length === 0 ? (
							<p className="text-center text-gray-500">
								No attendance records yet.
							</p>
						) : (
							<table className="min-w-full leading-normal">
								<thead>
									<tr>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											User Name
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Email
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Timestamp
										</th>
									</tr>
								</thead>
								<tbody>
									{attendance.map((record) => (
										<tr key={record._id}>
											<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
												{record.userId?.name ||
													"Unknown"}
											</td>
											<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
												{record.userId?.email ||
													"Unknown"}
											</td>
											<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
												{new Date(
													record.createdAt
												).toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</section>

				{/* Student List */}
				<section className="w-full max-w-2xl mt-8">
					<h2 className="text-2xl font-semibold mb-4 text-gray-700">
						Student List
					</h2>
					<div className="bg-white shadow rounded-lg p-4">
						{knownFaces.length === 0 ? (
							<p className="text-center text-gray-500">
								No student records yet.
							</p>
						) : (
							<ul>
								{knownFaces.map((record) => (
									<li
										key={record.id}
										className="flex justify-between items-center py-2 border-b last:border-0"
									>
										<span className="font-medium text-gray-800">
											{record.name}
										</span>
										<span className="text-sm text-gray-500">
											{record.email}
										</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</section>
			</main>

			{/* Toast Notifications */}
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};
export default App;
