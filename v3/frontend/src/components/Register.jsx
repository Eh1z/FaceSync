import React, { useState, useRef, useEffect } from "react";
import CameraComponent from "./Camera";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";

const Register = ({ onAddUser, onCancel, courses }) => {
	const [step, setStep] = useState("form");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [studentId, setStudentId] = useState("");
	const [mat_num, setMat_num] = useState("");
	const [selectedCourses, setSelectedCourses] = useState([]); // State to store selected courses
	const [capturedImage, setCapturedImage] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const cameraRef = useRef(null);

	// Handle multi-select change for courses
	const handleCourseChange = (e) => {
		// Using the spread operator to keep the previous selections and add the new ones
		const selected = Array.from(
			e.target.selectedOptions,
			(option) => option.value
		);
		setSelectedCourses((prevSelectedCourses) => [
			...prevSelectedCourses, // Keep previous selections
			...selected.filter(
				(course) => !prevSelectedCourses.includes(course)
			), // Add new selections
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
		setStep("capturing");
		if (cameraRef.current) cameraRef.current.startCamera();
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
			mat_num: mat_num.trim(),
			studentId: studentId.trim(),
			userImage: capturedImage, // Captured face image
			courses: selectedCourses, // Selected course IDs
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
								htmlFor="name"
							>
								Student ID
							</label>
							<input
								id="name"
								type="text"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your name"
								value={studentId}
								onChange={(e) => setStudentId(e.target.value)}
							/>
						</div>
						<div>
							<label
								className="block text-gray-600 mb-1"
								htmlFor="name"
							>
								Mat. Number
							</label>
							<input
								id="name"
								type="text"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your name"
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
