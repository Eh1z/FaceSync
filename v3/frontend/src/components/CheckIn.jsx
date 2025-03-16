import React, { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs"; // Import TFJS
import { getUsers, markAttendance } from "../api";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import * as faceapi from "face-api.js";
import CameraComponent from "./Camera";

const CheckIn = ({ onMarkAttendance, onCancel }) => {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [capturedImage, setCapturedImage] = useState(null);
	const [step, setStep] = useState("capturing");

	const cameraRef = useRef(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		const init = async () => {
			try {
				// Ensure TensorFlow.js is ready and set the backend
				await tf.setBackend("webgl");
				await tf.ready();

				// Fetch users and load face-api models
				const usersResponse = await getUsers();
				setUsers(usersResponse.data);

				await Promise.all([
					faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
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

		init();
	}, []);

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

		// Detect a single face with landmarks and compute its descriptor
		const detection = await faceapi
			.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceDescriptor();

		if (!detection) {
			toast.error("No face detected in the captured image.");
			return;
		}

		// Draw bounding box around the detected face
		const { x, y, width, height } = detection.detection.box;
		ctx.strokeStyle = "green";
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, width, height);

		// Build labeled face descriptors from stored users (assumes each user has a faceDescriptor property)
		const labeledFaceDescriptors = users
			.filter((user) => user.faceDescriptor)
			.map(
				(user) =>
					new faceapi.LabeledFaceDescriptors(user.name, [
						new Float32Array(user.faceDescriptor),
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

		// Find the best match for the captured face descriptor
		const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

		// Write the matching user name (or "unknown") above the bounding box
		ctx.font = "16px Arial";
		ctx.fillStyle = "green";
		ctx.fillText(bestMatch.label, x, y - 10);

		// Optionally, mark attendance automatically:
		// if (bestMatch.label !== "unknown") {
		//   onMarkAttendance(bestMatch.label);
		// }
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
						</>
					)}
				</>
			)}
		</div>
	);
};

export default CheckIn;
