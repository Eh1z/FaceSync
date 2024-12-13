// src/App.jsx
import React, { useState, useEffect } from "react";
import CameraComponent from "./components/Camera";
import Register from "./components/Register";
import { getUsers, markAttendance, getAttendance } from "./api";
import { compareFaces } from "./utils/faceRecognition";

const App = () => {
	const [knownFaces, setKnownFaces] = useState([]);
	const [attendance, setAttendance] = useState([]);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await getUsers();
				setKnownFaces(response.data);
			} catch (err) {
				console.error("Error fetching users:", err);
			}
		};
		const fetchAttendance = async () => {
			try {
				const response = await getAttendance();
				setAttendance(response.data);
			} catch (err) {
				console.error("Error fetching attendance:", err);
			}
		};
		fetchUsers();
		fetchAttendance();
	}, []);

	const handleFaceDetected = async (landmarks) => {
		console.log("Face detected with landmarks:", landmarks);
		// Iterate through known faces and compare
		for (let user of knownFaces) {
			if (compareFaces(user.faceData, landmarks)) {
				// Check if attendance is already marked for today
				const today = new Date().toISOString().split("T")[0];
				const alreadyMarked = attendance.some(
					(record) =>
						record.userId === user._id &&
						record.date.startsWith(today)
				);

				if (!alreadyMarked) {
					try {
						// Mark attendance
						const response = await markAttendance(user._id);
						setAttendance((prev) => [
							...prev,
							{
								userId: user._id,
								name: user.name,
								date: new Date().toISOString(),
							},
						]);
						alert(`Attendance marked for ${user.name}`);
					} catch (err) {
						console.error("Error marking attendance:", err);
						alert("Failed to mark attendance.");
					}
				} else {
					alert(`Attendance already marked for ${user.name} today.`);
				}
				break;
			}
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 p-4">
			<header className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-center text-gray-800">
					Facial Recognition Attendance
				</h1>
				{/* Optional: Theme Toggle Button */}
			</header>
			<main className="flex flex-col items-center">
				<Register />
				<section className="w-full max-w-2xl mt-8">
					<h2 className="text-2xl font-semibold mb-4 text-gray-700">
						Attendance List
					</h2>
					<div className="bg-white shadow rounded-lg p-4">
						{attendance.length === 0 ? (
							<p className="text-center text-gray-500">
								No attendance records yet.
							</p>
						) : (
							<ul>
								{attendance.map((record, index) => (
									<li
										key={index}
										className="flex justify-between items-center py-2 border-b last:border-0"
									>
										<span className="font-medium text-gray-800">
											{record.name}
										</span>
										<span className="text-sm text-gray-500">
											{new Date(
												record.date
											).toLocaleString()}
										</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</section>
			</main>
		</div>
	);
};

export default App;
