import React, { useState, useRef, useEffect } from "react";
import { getUsers, markAttendance } from "../api";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import * as faceapi from "face-api.js";
import CameraComponent from "./Camera";

const CheckIn = ({ onMarkAttendance, onCancel }) => {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [capturedImage, setCapturedImage] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [step, setStep] = useState("capturing");

	const cameraRef = useRef(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		const fetchUsersAndLoadModels = async () => {
			try {
				const usersResponse = await getUsers();
				setUsers(usersResponse.data);

				await Promise.all([
					faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
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

		const img = new Image();
		img.src = capturedImage;
		await new Promise((resolve) => (img.onload = resolve));

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		canvas.width = img.width;
		canvas.height = img.height;

		ctx.drawImage(img, 0, 0, img.width, img.height);

		const detections = await faceapi.detectAllFaces(
			img,
			new faceapi.TinyFaceDetectorOptions()
		);

		if (detections.length === 0) {
			toast.error("No face detected in the captured image.");
			return;
		}

		const resizedDetections = faceapi.resizeResults(detections, {
			width: img.width,
			height: img.height,
		});

		resizedDetections.forEach((detection) => {
			const { x, y, width, height } = detection.box;
			ctx.strokeStyle = "green";
			ctx.lineWidth = 2;
			ctx.strokeRect(x, y, width, height);
		});
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
