import React, { useState, useRef, useEffect } from "react";
import CameraComponent from "./Camera";
import { getUsers, markAttendance } from "../api";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import * as faceapi from "face-api.js";

const CheckIn = ({ onMarkAttendance, onCancel }) => {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [matchedUser, setMatchedUser] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentExpression, setCurrentExpression] = useState("");
	const cameraRef = useRef(null);
	const intervalRef = useRef();

	useEffect(() => {
		const fetchUsersAndLoadModels = async () => {
			try {
				// 1. Fetch users from your API
				const usersResponse = await getUsers();
				setUsers(usersResponse.data);

				// 2. Load face detection and expression models
				await Promise.all([
					faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
					faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
					faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
					faceapi.nets.faceExpressionNet.loadFromUri("/models"), // IMPORTANT: load expression model
				]);
				console.log("Models loaded");
			} catch (error) {
				toast.error("Initialization failed");
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUsersAndLoadModels();
	}, []);

	// Face detection and expression detection
	useEffect(() => {
		if (!cameraRef.current || isLoading) return;

		const video = cameraRef.current;
		const canvas = document.getElementById("canvas");

		const handleLoadedMetadata = async () => {
			const detectionOptions = new faceapi.TinyFaceDetectorOptions({
				inputSize: 128,
				scoreThreshold: 0.4,
			});

			intervalRef.current = setInterval(async () => {
				try {
					// If the video hasn't loaded enough to have valid width/height, skip
					if (!video.videoWidth || !video.videoHeight) {
						console.log("Waiting for video feed...");
						return;
					}

					// Match canvas to the video’s size
					const displaySize = {
						width: video.videoWidth,
						height: video.videoHeight,
					};
					faceapi.matchDimensions(canvas, displaySize);

					// 3. Detect faces with landmarks, descriptors, and expressions
					const faces = await faceapi
						.detectAllFaces(video, detectionOptions)
						.withFaceLandmarks()
						.withFaceExpressions()
						.withFaceDescriptors();

					// Draw detection boxes on the canvas
					if (faces.length > 0) {
						const resized = faceapi.resizeResults(
							faces,
							displaySize
						);
						faceapi.draw.drawDetections(canvas, resized);

						// 4. Face matching logic (e.g., match descriptor to user)
						const match = matchFaceWithUsers(
							faces[0].descriptor,
							users
						);
						setMatchedUser(match);

						// 5. Get dominant expression from the first detected face
						const dominantExpression = getDominantExpression(
							faces[0].expressions
						);
						setCurrentExpression(dominantExpression);
					} else {
						// Reset states if no face is detected
						setMatchedUser(null);
						setCurrentExpression("");
					}
				} catch (error) {
					console.error("Detection error:", error);
				}
			}, 300); // adjust interval as needed
		};

		video.addEventListener("loadedmetadata", handleLoadedMetadata);

		return () => {
			clearInterval(intervalRef.current);
			video.removeEventListener("loadedmetadata", handleLoadedMetadata);
		};
	}, [isLoading, users]);

	// Helper function to match face descriptors with user descriptors
	// (You would replace the logic below with your actual matching algorithm)
	const matchFaceWithUsers = (descriptor, users) => {
		// E.g., find the user whose stored descriptor is "closest" to the current descriptor
		// For demo purposes, returning the first user
		return users[0] || null;
	};

	// Helper function to get the dominant expression
	const getDominantExpression = (expressions) => {
		let dominant = "";
		let maxVal = 0;
		for (const [expression, probability] of Object.entries(expressions)) {
			if (probability > maxVal) {
				dominant = expression;
				maxVal = probability;
			}
		}
		return dominant;
	};

	// Confirm attendance
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
			onMarkAttendance(); // optional: refresh attendance records
			setMatchedUser(null);
			setCurrentExpression("");
		} catch (error) {
			console.error("Error marking attendance:", error);
			toast.error("Failed to mark attendance.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="w-full bg-white shadow-md rounded-lg p-6">
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					{/* Camera Area */}
					<div className="relative">
						<canvas
							id="canvas"
							className="absolute top-0 left-0"
							style={{
								width: cameraRef.current?.videoWidth || "100%",
								height:
									cameraRef.current?.videoHeight || "100%",
							}}
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
