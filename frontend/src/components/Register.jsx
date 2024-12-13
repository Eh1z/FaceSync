// src/components/Register.jsx
import React, { useState, useRef } from "react";
import CameraComponent from "./Camera";
import { addUser } from "../api";
import { toast } from "react-toastify"; // For toast notifications

const Register = () => {
	const [step, setStep] = useState("form"); // 'form', 'capturing', 'preview'
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [capturedImage, setCapturedImage] = useState(null);
	const [faceLandmarks, setFaceLandmarks] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const cameraRef = useRef(null);

	// Handle starting the capture process
	const handleStartCapture = () => {
		if (!name.trim() || !email.trim()) {
			toast.error("Please enter both name and email.");
			return;
		}
		setStep("capturing");
		// Start the camera
		if (cameraRef.current) {
			cameraRef.current.startCamera();
		}
	};

	// Handle capturing the image
	const handleCapture = () => {
		if (cameraRef.current) {
			const imageData = cameraRef.current.capture();
			if (imageData) {
				if (faceLandmarks) {
					setCapturedImage(imageData);
					setStep("preview");
					// Stop the camera after capturing
					cameraRef.current.stopCamera();
				} else {
					toast.error("No face detected. Please try again.");
				}
			} else {
				toast.error("Failed to capture image. Please try again.");
			}
		}
	};

	// Handle retaking the image
	const handleRetake = () => {
		setCapturedImage(null);
		setFaceLandmarks(null);
		setStep("capturing");
		// Restart the camera for retaking
		if (cameraRef.current) {
			cameraRef.current.startCamera();
		}
	};

	// Handle confirming the registration
	const handleConfirm = async () => {
		if (!capturedImage || !faceLandmarks) {
			toast.error("No image or face data to submit.");
			return;
		}

		setIsSubmitting(true);
		const user = {
			name: name.trim(),
			email: email.trim(),
			faceData: faceLandmarks, // Store facial landmarks
		};

		try {
			await addUser(user);
			toast.success("User registered successfully!");
			// Reset form
			setName("");
			setEmail("");
			setCapturedImage(null);
			setFaceLandmarks(null);
			setStep("form");
		} catch (error) {
			console.error("Error registering user:", error);
			toast.error("Failed to register user.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle face detection from CameraComponent
	const handleFaceDetected = (landmarks) => {
		if (landmarks) {
			setFaceLandmarks(landmarks);
		} else {
			setFaceLandmarks(null);
		}
	};

	return (
		<div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mx-auto">
			{step === "form" && (
				<>
					<h2 className="text-xl font-semibold mb-4 text-gray-700">
						Register User
					</h2>
					<form
						className="space-y-4"
						onSubmit={(e) => e.preventDefault()}
					>
						<div>
							<label
								className="block text-gray-600 mb-1"
								htmlFor="name"
							>
								Name
							</label>
							<input
								id="name"
								type="text"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div>
							<label
								className="block text-gray-600 mb-1"
								htmlFor="email"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<button
							type="button"
							onClick={handleStartCapture}
							className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
						>
							Start Capture
						</button>
					</form>
				</>
			)}

			{step === "capturing" && (
				<>
					<h2 className="text-xl font-semibold mb-4 text-gray-700">
						Capture Your Face
					</h2>
					<CameraComponent
						ref={cameraRef}
						onFaceDetected={handleFaceDetected}
					/>
					<button
						type="button"
						onClick={handleCapture}
						className={`w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 mt-4 ${
							!faceLandmarks
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
						disabled={!faceLandmarks}
					>
						Capture
					</button>
					{!faceLandmarks && (
						<p className="text-red-500 text-sm mt-2">
							No face detected. Please align your face within the
							frame.
						</p>
					)}
				</>
			)}

			{step === "preview" && (
				<>
					<h2 className="text-xl font-semibold mb-4 text-gray-700">
						Review Your Image
					</h2>
					{capturedImage && (
						<img
							src={capturedImage}
							alt="Captured"
							className="w-full h-auto rounded-md mb-4"
						/>
					)}
					<div className="flex justify-between">
						<button
							type="button"
							onClick={handleRetake}
							className="w-1/2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200 mr-2"
						>
							Retake
						</button>
						<button
							type="button"
							onClick={handleConfirm}
							className={`w-1/2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 ml-2 ${
								isSubmitting
									? "opacity-50 cursor-not-allowed"
									: ""
							}`}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Submitting..." : "Confirm"}
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default Register;
