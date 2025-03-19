import React, { useState, useRef, useEffect } from "react";
import { getUsers, markAttendance } from "../api";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import * as faceapi from "@vladmandic/face-api";
import CameraComponent from "./Camera";

const CheckIn = ({ studentId, setStudentId }) => {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [capturedImage, setCapturedImage] = useState(null);
	const [step, setStep] = useState("capturing");
	const [bestMatchLabel, setBestMatchLabel] = useState(null); // Store the best match label for attendance

	const cameraRef = useRef(null);
	const canvasRef = useRef(null);

	// Load face-api models and users on mount
	useEffect(() => {
		const init = async () => {
			try {
				// Fetch users and load face-api models
				const usersResponse = await getUsers();
				setUsers(usersResponse.data);
				console.log("fetched users: ", users);

				await Promise.all([
					faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
					faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
					faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
					faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
				]);
				console.log("Models loaded");
			} catch (error) {
				toast.error("Initialization failed");
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		init();
	}, []);

	const handleCapture = () => {
		if (cameraRef.current) {
			const imageData = cameraRef.current.capture();
			if (imageData) {
				setCapturedImage(imageData);
				setStep("preview");
				cameraRef.current.stopCamera();
			} else {
				toast.error("Failed to capture image. Please try again.");
			}
		}
	};

	const processCapturedImage = async () => {
		if (!capturedImage || !canvasRef.current) return;

		// Create an Image element from the captured image data
		const img = new Image();
		img.src = capturedImage;
		await new Promise((resolve) => (img.onload = resolve));

		// Prepare canvas
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0, img.width, img.height);

		// Detect a single face with landmarks
		const useTinyModel = true;
		const detection = await faceapi
			.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks(useTinyModel)
			.withFaceDescriptor();

		if (!detection) {
			toast.error("No face detected in the captured image.");
			return;
		}

		// Draw bounding box around the detected face
		const { x, y, width, height } = detection.detection.box;
		ctx.strokeStyle = "lime";
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, width, height);

		// Build labeled face data from stored users (assumes each user has a faceDescriptor property)
		const labeledFaceDescriptors = users
			.filter((user) => user.faceData)
			.map(
				(user) =>
					new faceapi.LabeledFaceDescriptors(user.name, [
						new Float32Array(user.faceData),
					])
			);

		if (labeledFaceDescriptors.length === 0) {
			toast.error(
				"No stored face descriptors available for recognition."
			);
			return;
		}

		// Create a FaceMatcher with a threshold (0.6 is typical)
		const faceMatcher = new faceapi.FaceMatcher(
			labeledFaceDescriptors,
			0.6
		);

		// Use the face descriptor from the captured image for matching
		const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

		// Write the matching user name (or "unknown") above the bounding box
		setBestMatchLabel(bestMatch.label); // Set the label for the matched user
		ctx.font = "32px Arial";
		ctx.fillStyle = "lime";
		ctx.fillText(bestMatch.label, x, y - 10);
	};

	useEffect(() => {
		if (step === "preview" && capturedImage) {
			processCapturedImage();
		}
	}, [step, capturedImage]);

	const handleRetake = () => {
		setCapturedImage(null);
		setStep("capturing");
	};

	const handleConfirm = () => {
		if (bestMatchLabel !== "unknown") {
			// Find the user whose name matches the bestMatchLabel
			const matchedUser = users.find(
				(user) => user.name === bestMatchLabel
			);

			if (matchedUser) {
				// Use the user's _id (e.g., for marking attendance)
				setStudentId(matchedUser._id);
				toast.success(`${bestMatchLabel} marked as present`);
			} else {
				toast.error("No matching user found.");
			}
		} else {
			toast.error("No matching user found.");
		}
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
								onClick={handleCapture}
								className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
							>
								Capture
							</button>
						</>
					)}

					{step === "preview" && (
						<>
							<h2 className="text-xl font-semibold mb-4 text-gray-700">
								Review Check-In Photo
							</h2>
							<canvas ref={canvasRef} className="w-full" />
							<button
								onClick={handleRetake}
								className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
							>
								Retake
							</button>
							<button
								onClick={handleConfirm}
								className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
							>
								Confirm and Mark Attendance
							</button>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default CheckIn;
