// src/components/Register.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import CameraComponent from "./Camera";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";

const Register = ({ onAddUser, onCancel }) => {
	const [step, setStep] = useState("form"); // 'form', 'capturing', 'preview'
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [capturedImage, setCapturedImage] = useState(null);
	const [capturedFaceLandmarks, setCapturedFaceLandmarks] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const cameraRef = useRef(null);

	// Callback to handle detected face landmarks
	const handleFaceDetected = useCallback(
		(landmarks) => {
			console.log(`Face detected in step: ${step}`);
			if (step !== "capturing") {
				console.log("Ignoring face detection outside capturing step.");
				return; // Only handle during 'capturing' step
			}
			if (landmarks) {
				setCapturedFaceLandmarks(landmarks);
				console.log("Face landmarks updated.");
			} else {
				setCapturedFaceLandmarks(null);
				console.log("No face detected.");
			}
		},
		[step]
	);

	const handleStartCapture = () => {
		if (!name.trim() || !email.trim()) {
			toast.error("Please enter both name and email.");
			console.log("Start Capture: Missing name or email.");
			return;
		}
		console.log("Starting capture process.");
		setStep("capturing");
		// Start the camera
		if (cameraRef.current) {
			cameraRef.current.startCamera && cameraRef.current.startCamera();
			console.log("Start Capture: Camera start invoked.");
		}
	};

	const handleCapture = () => {
		console.log("Capturing image.");
		if (cameraRef.current) {
			const imageData = cameraRef.current.capture();
			if (imageData) {
				if (capturedFaceLandmarks) {
					setCapturedImage(imageData);
					setStep("preview");
					console.log("Image captured and moving to preview step.");
					// Stop the camera after capturing
					cameraRef.current.stopCamera &&
						cameraRef.current.stopCamera();
					console.log("Capture: Camera stop invoked.");
				} else {
					toast.error("No face detected. Please try again.");
					console.log("Capture failed: No face detected.");
				}
			} else {
				toast.error("Failed to capture image. Please try again.");
				console.log("Capture failed: Image data is null.");
			}
		}
	};

	const handleRetake = () => {
		console.log("Retaking image.");
		setCapturedImage(null);
		setCapturedFaceLandmarks(null); // Reset captured landmarks
		setStep("capturing");
		// Restart the camera for retaking
		if (cameraRef.current) {
			cameraRef.current.startCamera && cameraRef.current.startCamera();
			console.log("Retake: Camera start invoked.");
		}
	};

	const handleConfirm = async () => {
		console.log("Confirming registration.");
		if (!capturedImage || !capturedFaceLandmarks) {
			toast.error("No image or face data to submit.");
			console.log("Confirm failed: Missing image or face data.");
			return;
		}

		setIsSubmitting(true);
		const user = {
			name: name.trim(),
			email: email.trim(),
			faceData: capturedFaceLandmarks, // Use capturedFaceLandmarks
			image: capturedImage, // Include captured image
		};

		try {
			await onAddUser(user); // Use the passed prop
			toast.success("User registered successfully!");
			// Optionally, reset the form or navigate away
			setStep("form");
			setName("");
			setEmail("");
			setCapturedImage(null);
			setCapturedFaceLandmarks(null);
			console.log("User registration successful.");
		} catch (error) {
			console.error("Error registering user:", error);
			toast.error("Failed to register user.");
		} finally {
			setIsSubmitting(false);
			console.log("Registration submission complete.");
		}
	};

	// useEffect to stop the camera when transitioning to 'preview' step
	useEffect(() => {
		if (step === "preview") {
			if (cameraRef.current) {
				cameraRef.current.stopCamera && cameraRef.current.stopCamera();
				console.log("Preview: Camera stopped.");
			}
		}
	}, [step]);

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
						<button
							type="button"
							onClick={onCancel}
							className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
						>
							Cancel
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
							!capturedFaceLandmarks
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
						disabled={!capturedFaceLandmarks}
					>
						Capture
					</button>

					{!capturedFaceLandmarks && (
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
					{isSubmitting && <LoadingSpinner />}
				</>
			)}
		</div>
	);
};

export default Register;
