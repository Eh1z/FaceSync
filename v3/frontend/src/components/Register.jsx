import React, { useState, useRef, useEffect } from "react";
import CameraComponent from "./Camera";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";

const Register = ({ onAddUser, onCancel }) => {
	const [step, setStep] = useState("form");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [capturedImage, setCapturedImage] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const cameraRef = useRef(null);

	const handleStartCapture = () => {
		if (!name.trim() || !email.trim()) {
			toast.error("Please enter both name and email.");
			return;
		}
		setStep("capturing");
		if (cameraRef.current) {
			cameraRef.current.startCamera();
		}
	};

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

	const handleRetake = () => {
		setCapturedImage(null);
		setStep("capturing");
		cameraRef.current.startCamera();
	};

	const handleConfirm = async () => {
		if (!capturedImage) {
			toast.error("No image to submit.");
			return;
		}

		setIsSubmitting(true);
		const user = {
			name: name.trim(),
			email: email.trim(),
			userImage: capturedImage, // Save the captured image as base64
		};

		try {
			await onAddUser(user); // Send the user data (with image)
			toast.success("User registered successfully!");
			setStep("form");
			setName("");
			setEmail("");
			setCapturedImage(null);
		} catch (error) {
			toast.error("Failed to register user.");
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (step === "preview" && cameraRef.current) {
			cameraRef.current.stopCamera();
		}
	}, [step]);

	return (
		<div className="w-full bg-white shadow-md rounded-lg p-6">
			{step === "form" && (
				<>
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
					<CameraComponent ref={cameraRef} />
					<button
						type="button"
						onClick={handleCapture}
						className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 mt-4"
					>
						Capture
					</button>
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
