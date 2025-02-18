import React, { useState, useRef, useEffect } from "react";
import { getUsers, markAttendance } from "../api";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import * as faceapi from "face-api.js";
import CameraComponent from "./Camera";

const CheckIn = ({ onMarkAttendance, onCancel }) => {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [recognizedResults, setRecognizedResults] = useState([]); // Array of { detection, match, recognized }
	const [capturedImage, setCapturedImage] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [step, setStep] = useState("capturing"); // "capturing" or "preview"

	const cameraRef = useRef(null);
	const imageRef = useRef(null);
	const canvasRef = useRef(null);

	// Fetch users and load face detection models on mount
	useEffect(() => {
		const fetchUsersAndLoadModels = async () => {
			try {
				// Fetch registered users from the backend.
				const usersResponse = await getUsers();
				setUsers(usersResponse.data);

				// Load required models
				await Promise.all([
					faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
					faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
					faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
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

	// Capture image from the camera
	const handleCapture = () => {
		if (cameraRef.current) {
			const imageData = cameraRef.current.capture();
			if (imageData) {
				setCapturedImage(imageData);
				setStep("preview");
			} else {
				toast.error("Failed to capture image. Please try again.");
			}
		}
	};

	// Process the captured image: detect faces and compare with stored user images.
	const processCapturedImage = async () => {
		if (!capturedImage || !canvasRef.current || !imageRef.current) return;

		// Use the already rendered image from imageRef
		const img = imageRef.current;
		// Get the displayed dimensions from the rendered image
		const displayedWidth = img.offsetWidth;
		const displayedHeight = img.offsetHeight;

		// Set up canvas dimensions to match the displayed image.
		const canvas = canvasRef.current;
		canvas.width = displayedWidth;
		canvas.height = displayedHeight;
		const displaySize = { width: displayedWidth, height: displayedHeight };
		faceapi.matchDimensions(canvas, displaySize);

		try {
			// Detect all faces in the captured image along with landmarks and descriptors.
			const detections = await faceapi
				.detectAllFaces(img)
				.withFaceLandmarks()
				.withFaceDescriptors();

			if (detections.length === 0) {
				toast.error("No face detected in the captured image.");
				setRecognizedResults([]);
				return;
			}

			// Resize detections to match the display size.
			const resizedDetections = faceapi.resizeResults(
				detections,
				displaySize
			);

			const results = [];
			// For each detected face, compare with each registered user.
			for (let detection of detections) {
				let bestMatch = null;
				let minDistance = Infinity;

				// Loop through each user.
				for (let user of users) {
					// If the user doesn’t already have a descriptor cached, compute it.
					if (!user.descriptor && user.userImage) {
						const userImg = new Image();
						userImg.src = user.userImage;
						await new Promise((resolve) => {
							userImg.onload = resolve;
						});
						const userDetection = await faceapi
							.detectSingleFace(userImg)
							.withFaceLandmarks()
							.withFaceDescriptor();
						if (userDetection) {
							user.descriptor = userDetection.descriptor;
						}
					}
					if (user.descriptor) {
						const distance = faceapi.euclideanDistance(
							detection.descriptor,
							user.descriptor
						);
						if (distance < minDistance) {
							minDistance = distance;
							bestMatch = user;
						}
					}
				}

				// If distance is less than a threshold (e.g., 0.6), consider it a match.
				if (minDistance < 0.6) {
					results.push({
						detection,
						match: bestMatch,
						recognized: true,
					});
				} else {
					results.push({ detection, recognized: false });
				}
			}

			// Draw bounding boxes on the canvas.
			const ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			resizedDetections.forEach((result, index) => {
				const box = result.detection.box;
				const res = results[index];
				// Set color based on recognition result.
				const boxColor = res.recognized ? "green" : "red";
				new faceapi.draw.DrawBox(box, { label: "", boxColor }).draw(
					canvas
				);
				// If recognized, write the name above the box.
				if (res.recognized && res.match && res.match.name) {
					ctx.font = "16px Arial";
					ctx.fillStyle = "white";
					ctx.fillText(res.match.name, box.x, box.y - 10);
				}
			});

			setRecognizedResults(results);
		} catch (error) {
			console.error("Detection error:", error);
			toast.error("Detection error.");
		}
	};

	// Process image once captured when we transition to "preview" step.
	useEffect(() => {
		if (step === "preview" && capturedImage) {
			processCapturedImage();
		}
	}, [step, capturedImage]);

	// Confirm attendance for all recognized users.
	const handleConfirmAttendance = async () => {
		const recognizedUsers = recognizedResults
			.filter((r) => r.recognized && r.match)
			.map((r) => r.match);

		if (recognizedUsers.length === 0) {
			toast.error("No recognized user found for attendance.");
			return;
		}

		setIsSubmitting(true);
		try {
			// Mark attendance for each recognized user.
			for (let user of recognizedUsers) {
				await markAttendance(user._id);
			}
			toast.success("Attendance marked for recognized user(s)!");
			onMarkAttendance(); // Optionally refresh attendance records
			// Reset state for a new check-in.
			setRecognizedResults([]);
			setCapturedImage(null);
			setStep("capturing");
		} catch (error) {
			console.error("Error marking attendance:", error);
			toast.error("Failed to mark attendance.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Allow retaking the check-in image.
	const handleRetake = () => {
		setCapturedImage(null);
		setRecognizedResults([]);
		setStep("capturing");
	};

	return (
		<div className="w-full bg-white shadow-md rounded-lg p-6">
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					{step === "capturing" && (
						<>
							<h2 className="text-xl font-semibold mb-4 text-gray-700">
								Capture Your Check-In Photo
							</h2>
							<CameraComponent ref={cameraRef} />
							<button
								type="button"
								onClick={handleCapture}
								className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
							>
								Capture
							</button>
							<button
								type="button"
								onClick={onCancel}
								className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
							>
								Cancel
							</button>
						</>
					)}

					{step === "preview" && (
						<>
							<h2 className="text-xl font-semibold mb-4 text-gray-700">
								Review Check-In Photo
							</h2>
							<div className="relative inline-block">
								{capturedImage && (
									<img
										ref={imageRef}
										src={capturedImage}
										alt="Captured Check-In"
										style={{ maxWidth: "100%" }}
									/>
								)}
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
							<div className="flex justify-between mt-4">
								<button
									type="button"
									onClick={handleRetake}
									className="w-1/2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200 mr-2"
								>
									Retake
								</button>
								<button
									type="button"
									onClick={handleConfirmAttendance}
									disabled={isSubmitting}
									className={`w-1/2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 ml-2 ${
										isSubmitting
											? "opacity-50 cursor-not-allowed"
											: ""
									}`}
								>
									{isSubmitting
										? "Marking Attendance..."
										: "Confirm Attendance"}
								</button>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default CheckIn;
