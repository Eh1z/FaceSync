import React, { useState, useRef, useEffect } from "react";
import CameraComponent from "./Camera";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api";

const Register = ({ onAddUser, onCancel, courses }) => {
	const [step, setStep] = useState("form");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [studentId, setStudentId] = useState("");
	const [mat_num, setMat_num] = useState("");
	const [selectedCourses, setSelectedCourses] = useState([]); // State to store selected courses
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
					faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
				]);
				console.log("FaceAPI models loaded. ");
			} catch (error) {
				toast.error("Failed to load face detection models.");
				console.error(error);
			}
		};
		loadModels();
	}, []);

	// Handle multi-select change for courses
	const handleCourseChange = (e) => {
		const selected = Array.from(
			e.target.selectedOptions,
			(option) => option.value
		);
		setSelectedCourses((prevSelectedCourses) => [
			...prevSelectedCourses,
			...selected.filter(
				(course) => !prevSelectedCourses.includes(course)
			),
		]);
	};

	// Handle course removal
	const handleRemoveCourse = (courseId) => {
		setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
	};

	const handleStartCapture = () => {
		if (!name.trim() || !email.trim() || selectedCourses.length === 0) {
			toast.error(
				"Please enter name, email, and select at least one course."
			);
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
		const useTinyModel = true;
		const detection = await faceapi
			.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks(useTinyModel);

		console.log("logiing results for testing: ", detection.landmarks);
		setFaceData(detection.landmarks._positions);

		if (!detection) {
			toast.error("No face detected, please retake the photo.");
			return;
		}

		// Draw bounding box
		const { x, y, width, height } = detection.detection.box;
		ctx.strokeStyle = "green";
		ctx.lineWidth = 3;
		ctx.strokeRect(x, y, width, height);
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
			mat_num: mat_num.trim(),
			studentId: studentId.trim(),
			userImage: capturedImage, // Captured face image
			courses: selectedCourses, // Selected course IDs
			faceData: faceData,
		};

		try {
			await onAddUser(user);
			toast.success("User registered successfully!");
			// Reset form
			setStep("form");
			setName("");
			setEmail("");
			setStudentId("");
			setMat_num("");
			setSelectedCourses([]);
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
								htmlFor="studentId"
							>
								Student ID
							</label>
							<input
								id="studentId"
								type="text"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your Student ID"
								value={studentId}
								onChange={(e) => setStudentId(e.target.value)}
							/>
						</div>
						<div>
							<label
								className="block text-gray-600 mb-1"
								htmlFor="mat_num"
							>
								Mat. Number
							</label>
							<input
								id="mat_num"
								type="text"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your Mat Number"
								value={mat_num}
								onChange={(e) => setMat_num(e.target.value)}
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

						{/* Select Courses */}
						<div>
							<label
								className="block text-gray-600 mb-1"
								htmlFor="courses"
							>
								Select Courses
							</label>
							<select
								id="courses"
								multiple
								value={selectedCourses}
								onChange={handleCourseChange}
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
							>
								{courses &&
									courses.map((course) => (
										<option
											key={course._id}
											value={course._id}
										>
											{course.courseName} (
											{course.courseCode})
										</option>
									))}
							</select>
						</div>

						{/* Display selected courses */}
						{selectedCourses.length > 0 && (
							<div className="mb-4">
								<h4 className="font-semibold">
									Selected Courses:
								</h4>
								<div className="flex flex-wrap gap-2">
									{selectedCourses.map((courseId) => {
										const courseObj = courses.find(
											(course) => course._id === courseId
										);
										return (
											<div
												key={courseId}
												className="flex items-center bg-gray-200 rounded px-2 py-1"
											>
												<span className="mr-2">
													{courseObj
														? courseObj.courseCode
														: courseId}
												</span>
												<button
													type="button"
													onClick={() =>
														handleRemoveCourse(
															courseId
														)
													}
													className="text-red-500"
												>
													x
												</button>
											</div>
										);
									})}
								</div>
							</div>
						)}

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
					{/* Render the canvas with the face detection overlay */}
					<canvas
						ref={canvasRef}
						className="w-full h-auto rounded-md mb-4"
					/>
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
