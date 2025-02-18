// src/components/CourseCreation.jsx
import React, { useState, useEffect } from "react";
import { addCourse, getLecturers } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Courses = () => {
	const [courseName, setCourseName] = useState("");
	const [courseCode, setCourseCode] = useState("");
	const [lecturer, setLecturer] = useState("");
	const [lecturers, setLecturers] = useState([]);

	useEffect(() => {
		const fetchLecturers = async () => {
			try {
				const response = await getLecturers();
				setLecturers(response.data);
			} catch (error) {
				toast.error("Failed to fetch lecturers");
				console.error("Error fetching lecturers:", error);
			}
		};
		fetchLecturers();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!courseName.trim() || !courseCode.trim()) {
			toast.error("Course Name and Course Code are required.");
			return;
		}

		const newCourse = {
			courseName: courseName.trim(),
			courseCode: courseCode.trim(),
			lecturer: lecturer || null, // Optional: pass lecturer ID if selected
		};

		try {
			await addCourse(newCourse);
			toast.success("Course created successfully!");
			// Reset form fields
			setCourseName("");
			setCourseCode("");
			setLecturer("");
		} catch (error) {
			toast.error("Failed to create course.");
			console.error("Course creation error:", error);
		}
	};

	return (
		<div className="w-full max-w-[800px] mx-auto p-6 bg-white shadow rounded">
			<h2 className="text-2xl font-bold mb-4">Create Course</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="courseName" className="block text-gray-700">
						Course Name
					</label>
					<input
						type="text"
						id="courseName"
						value={courseName}
						onChange={(e) => setCourseName(e.target.value)}
						className="w-full border p-2 rounded"
						placeholder="Enter course name"
						required
					/>
				</div>
				<div>
					<label htmlFor="courseCode" className="block text-gray-700">
						Course Code
					</label>
					<input
						type="text"
						id="courseCode"
						value={courseCode}
						onChange={(e) => setCourseCode(e.target.value)}
						className="w-full border p-2 rounded"
						placeholder="Enter course code"
						required
					/>
				</div>
				<div>
					<label htmlFor="lecturer" className="block text-gray-700">
						Lecturer (Optional)
					</label>
					<select
						id="lecturer"
						value={lecturer}
						onChange={(e) => setLecturer(e.target.value)}
						className="w-full border p-2 rounded"
					>
						<option value="">Select Lecturer</option>
						{lecturers.map((lect) => (
							<option key={lect._id} value={lect._id}>
								{lect.name} ({lect.email})
							</option>
						))}
					</select>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
				>
					Create Course
				</button>
			</form>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Courses;
