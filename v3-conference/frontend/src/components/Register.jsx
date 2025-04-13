import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import * as faceapi from "@vladmandic/face-api";

const Register = ({ onAddUser }) => {
	const [step, setStep] = useState("form");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [job, setJob] = useState("");
	const [phone, setPhone] = useState("");
	const [age, setAge] = useState("");
	const [capturedImage, setCapturedImage] = useState(null);
	const [faceData, setFaceData] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const cameraRef = useRef(null);
	const canvasRef = useRef(null);

	// Load face-api models on mount
	useEffect(() => {
		const loadModels = async () => {
			try {
				await Promise.all([
					faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
					faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
					faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
					faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
				]);
				console.log("FaceAPI models loaded.");
			} catch (error) {
				toast.error("Failed to load face detection models.");
				console.error(error);
			}
		};
		loadModels();
	}, []);

	const handleStartCapture = () => {
		if (
			!name.trim() ||
			!email.trim() ||
			!job.trim() ||
			!phone.trim() ||
			!age.trim()
		) {
			toast.error("Please enter all required fields.");
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
		setFaceData(null);
		setStep("capturing");
		if (cameraRef.current) cameraRef.current.startCamera();
	};

	// Process the captured image: draw a bounding box and compute the face descriptor.
	const processCapturedImage = async () => {
		if (!capturedImage || !canvasRef.current) return;

		const img = new Image();
		img.src = capturedImage;
		await new Promise((resolve) => (img.onload = resolve));

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);

		// Detect a single face and compute its descriptor.
		const detection = await faceapi
			.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceDescriptor();

		if (!detection) {
			toast.error("No face detected, please retake the photo.");
			return;
		}

		// Draw bounding box
		const { x, y, width, height } = detection.detection.box;
		ctx.strokeStyle = "lime";
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, width, height);

		// Store the face descriptor (an array of numbers)
		const faceDescriptor = Array.from(detection.descriptor);
		setFaceData(faceDescriptor);
	};

	// When preview step is reached, process the captured image.
	useEffect(() => {
		if (step === "preview" && capturedImage) {
			processCapturedImage();
		}
	}, [step, capturedImage]);

	const handleConfirm = async () => {
		if (!capturedImage || !faceData) {
			toast.error("Face data not available. Please retake the photo.");
			return;
		}

		setIsSubmitting(true);
		const user = {
			name: name.trim(),
			email: email.trim(),
			job: job.trim(),
			phone: phone.trim(),
			age: age.trim(),
			userImage: capturedImage, // Captured face image
			faceData: faceData,
		};

		try {
			await onAddUser(user);
			toast.success("User registered successfully!");
			// Reset form
			setStep("form");
			setName("");
			setEmail("");
			setJob("");
			setPhone("");
			setAge("");
			setCapturedImage(null);
			setFaceData(null);
		} catch (error) {
			toast.error("Failed to register user.");
			console.error(error);
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
		<div className="w-full p-6 bg-white rounded-lg shadow-md">
			{step === "form" && (
				<>
					<form
						className="space-y-4"
						onSubmit={(e) => e.preventDefault()}
					>
						<div>
							<label
								className="block mb-1 text-gray-600"
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
								className="block mb-1 text-gray-600"
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
						<div>
							<label
								className="block mb-1 text-gray-600"
								htmlFor="job"
							>
								Job
							</label>
							<input
								id="job"
								type="text"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your job title"
								value={job}
								onChange={(e) => setJob(e.target.value)}
							/>
						</div>
						<div>
							<label
								className="block mb-1 text-gray-600"
								htmlFor="phone"
							>
								Phone
							</label>
							<input
								id="phone"
								type="text"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your phone number"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
							/>
						</div>
						<div>
							<label
								className="block mb-1 text-gray-600"
								htmlFor="age"
							>
								Age
							</label>
							<input
								id="age"
								type="number"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your age"
								value={age}
								onChange={(e) => setAge(e.target.value)}
							/>
						</div>
						<button
							type="button"
							onClick={handleStartCapture}
							className="w-full px-4 py-2 text-white transition duration-200 bg-blue-500 rounded-md hover:bg-blue-600"
						>
							Start Capture
						</button>
					</form>
				</>
			)}

			{step === "capturing" && (
				<>
					<h2 className="mb-4 text-xl font-semibold text-gray-700">
						Capture Your Face
					</h2>
					<CameraComponent ref={cameraRef} />
					<button
						type="button"
						onClick={handleCapture}
						className="w-full px-4 py-2 mt-4 text-white transition duration-200 bg-green-500 rounded-md hover:bg-green-600"
					>
						Capture
					</button>
				</>
			)}

			{step === "preview" && (
				<>
					<h2 className="mb-4 text-xl font-semibold text-gray-700">
						Review Your Image
					</h2>
					<canvas
						ref={canvasRef}
						className="w-full h-auto mb-4 rounded-md"
					/>
					<div className="flex justify-between">
						<button
							type="button"
							onClick={handleRetake}
							className="w-1/2 px-4 py-2 mr-2 text-white transition duration-200 bg-red-500 rounded-md hover:bg-red-600"
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
