import React, { useState, useRef, useEffect } from "react";
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
	const imageRef = useRef(null);
	const canvasRef = useRef(null);

	// Fetch users and load face detection models
	useEffect(() => {
		const fetchUsersAndLoadModels = async () => {
			try {
				// Fetch users
				const usersResponse = await getUsers();
				setUsers(usersResponse.data);

				// Load models: face detector, landmark, recognition, and expression models
				await Promise.all([
					faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
					faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
					faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
					faceapi.nets.faceExpressionNet.loadFromUri("/models"),
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

	// Handle the image load event and run face detection on the static image
	const handleImageLoad = async () => {
		if (!imageRef.current || !canvasRef.current) return;

		const img = imageRef.current;
		const canvas = canvasRef.current;

		// Set the canvas size to match the image dimensions
		canvas.width = img.width;
		canvas.height = img.height;
		const displaySize = { width: img.width, height: img.height };
		faceapi.matchDimensions(canvas, displaySize);

		// Configure detection options
		const detectionOptions = new faceapi.TinyFaceDetectorOptions({
			inputSize: 128,
			scoreThreshold: 0.4,
		});

		try {
			// Detect faces with landmarks, expressions, and descriptors
			const results = await faceapi
				.detectAllFaces(img, detectionOptions)
				.withFaceLandmarks()
				.withFaceExpressions()
				.withFaceDescriptors();

			if (results.length > 0) {
				// Resize detection results to match display size
				const resizedResults = faceapi.resizeResults(
					results,
					displaySize
				);

				// Draw bounding boxes without labels
				resizedResults.forEach((result) => {
					new faceapi.draw.DrawBox(result.detection.box, {
						label: "",
					}).draw(canvas);
				});

				// Use the first detected face for matching and expression analysis
				const face = results[0];
				const match = matchFaceWithUsers(face.descriptor, users);
				setMatchedUser(match);

				const dominantExpression = getDominantExpression(
					face.expressions
				);
				setCurrentExpression(dominantExpression);

				// Draw the matched user's name above the bounding box if a match is found
				if (match) {
					const ctx = canvas.getContext("2d");
					const box = resizedResults[0].detection.box;
					ctx.font = "16px Arial";
					ctx.fillStyle = "white";
					ctx.fillText(match.name, box.x, box.y - 10);
				}
			} else {
				setMatchedUser(null);
				setCurrentExpression("");
				toast.error("No face detected in the image.");
			}
		} catch (error) {
			console.error("Detection error:", error);
			toast.error("Detection error.");
		}
	};

	// Helper: Compare the detected face descriptor to your stored user descriptors
	// (Replace this logic with your actual matching algorithm)
	const matchFaceWithUsers = (descriptor, users) => {
		// For demonstration purposes, simply return the first user if available
		return users[0] || null;
	};

	// Helper: Determine the dominant expression from the expressions object
	const getDominantExpression = (expressions) => {
		let dominant = "";
		let maxProbability = 0;
		for (const [expression, probability] of Object.entries(expressions)) {
			if (probability > maxProbability) {
				dominant = expression;
				maxProbability = probability;
			}
		}
		return dominant;
	};

	// Confirm attendance when the user is matched
	const handleConfirmAttendance = async () => {
		if (!matchedUser) {
			toast.error("No user matched for attendance.");
			return;
		}

		setIsSubmitting(true);
		try {
			await markAttendance(matchedUser._id);
			toast.success(`Attendance marked for ${matchedUser.name}!`);
			onMarkAttendance(); // Optionally refresh attendance records
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
					{/* Image and Canvas Overlay */}
					<div className="relative inline-block">
						<img
							ref={imageRef}
							src="/images/youngman2.png"
							alt="For face detection"
							onLoad={handleImageLoad}
							style={{ maxWidth: "100%" }}
						/>
						<canvas
							ref={canvasRef}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								pointerEvents: "none",
							}}
						/>
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
