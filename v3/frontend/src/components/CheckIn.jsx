// src/components/CheckIn.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import CameraComponent from "./Camera";
import { getUsers, markAttendance } from "../api";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import {
	normalizeLandmarks,
	calculateCosineSimilarity,
} from "../utils/faceRecognition";

import * as faceapi from "face-api.js";

const CheckIn = ({ onMarkAttendance, onCancel }) => {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [matchedUser, setMatchedUser] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentExpression, setCurrentExpression] = useState(null); // Optional: To display expressions

	const cameraRef = useRef(null);

	// Fetch all users on component mount
	useEffect(() => {
		const fetchUsersData = async () => {
			try {
				const response = await getUsers();
				setUsers(response.data);
				console.log("Fetched users:", response.data);
			} catch (error) {
				console.error("Error fetching users:", error);
				toast.error("Failed to fetch users.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchUsersData();
	}, []);

	// Run Face API
	useEffect(() => {
		const run = async () => {
			try {
				console.log("Loading models...");
				await Promise.all([
					faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
					faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
					faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
					faceapi.nets.ageGenderNet.loadFromUri("/models"),
				]);
				console.log("Models loaded!");

				if (!cameraRef.current) {
					console.error("Camera is not available.");
					return;
				}

				const video = cameraRef.current;

				// Ensure video is playing before detecting faces
				video.onloadedmetadata = async () => {
					console.log("Video is ready, starting face detection...");

					setInterval(async () => {
						const faceData = await faceapi
							.detectAllFaces(
								video,
								new faceapi.SsdMobilenetv1Options()
							) // Use video
							.withFaceLandmarks()
							.withFaceDescriptors();

						console.log("Detected faces:", faceData);

						if (faceData.length > 0) {
							const canvas = document.getElementById("canvas");
							const displaySize = {
								width: video.width,
								height: video.height,
							};

							faceapi.matchDimensions(canvas, displaySize);
							const resizedResults = faceapi.resizeResults(
								faceData,
								displaySize
							);
							faceapi.draw.drawDetections(canvas, resizedResults);
						}
					}, 500); // Runs every 500ms (adjust for performance)
				};
			} catch (error) {
				console.error("Error:", error);
			}
		};

		run();
	}, []);

	const handleConfirmAttendance = async () => {
		if (!matchedUser) {
			toast.error("No user matched for attendance.");
			return;
		}

		setIsSubmitting(true);
		try {
			await markAttendance(matchedUser._id);
			toast.success(`Attendance marked for ${matchedUser.name}!`);
			console.log(`Attendance marked for user: ${matchedUser.name}`);
			onMarkAttendance(); // Refresh attendance records after marking
			setMatchedUser(null); // Reset matched user after marking attendance
		} catch (error) {
			console.error("Error marking attendance:", error);
			toast.error("Failed to mark attendance.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="w-full bg-white shadow-md rounded-lg p-6 ">
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					{/* Camera Area */}
					<div className="relative">
						<canvas
							id="canvas"
							className="absolute top-0 left-0 w-full h-full"
						/>

						<CameraComponent ref={cameraRef} />
					</div>

					{matchedUser ? (
						<div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-md">
							<p className="text-green-800">
								Welcome, <strong>{matchedUser.name}</strong>!
							</p>
							{currentExpression && (
								<p className="text-green-700">
									Detected Expression:{" "}
									<strong>{currentExpression}</strong>
								</p>
							)}
							<button
								type="button"
								onClick={handleConfirmAttendance}
								className={`mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 ${
									isSubmitting
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}
								disabled={isSubmitting}
							>
								{isSubmitting
									? "Marking Attendance..."
									: "Confirm Attendance"}
							</button>
							<button
								type="button"
								onClick={onCancel}
								className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
							>
								Cancel
							</button>
						</div>
					) : (
						<div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
							<p className="text-red-800">
								No matching user detected. Please try again.
							</p>
							<button
								type="button"
								onClick={onCancel}
								className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
							>
								Cancel
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default CheckIn;
