// src/components/CourseCreation.jsx
import React, { useState, useEffect } from "react";
import { addCourse, getLecturers, getCourses, updateCourse } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Courses = () => {
	const [courseName, setCourseName] = useState("");
	const [courseCode, setCourseCode] = useState("");
	const [lecturer, setLecturer] = useState("");
	const [lecturers, setLecturers] = useState([]);
	const [courses, setCourses] = useState([]);

	const [editingCourse, setEditingCourse] = useState(null);
	const [editingCourseName, setEditingCourseName] = useState("");
	const [editingCourseCode, setEditingCourseCode] = useState("");
	const [editingLecturer, setEditingLecturer] = useState("");

	useEffect(() => {
		fetchLecturers();
		fetchCourses();
	}, []);

	const fetchLecturers = async () => {
		try {
			const response = await getLecturers();
			setLecturers(response.data);
		} catch (error) {
			toast.error("Failed to fetch lecturers");
			console.error("Error fetching lecturers:", error);
		}
	};

	const fetchCourses = async () => {
		try {
			const response = await getCourses();
			setCourses(response.data);
		} catch (error) {
			toast.error("Failed to fetch courses");
			console.error("Error fetching courses:", error);
		}
	};

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
			fetchCourses(); // Reload the list of courses after adding
		} catch (error) {
			toast.error("Failed to create course.");
			console.error("Course creation error:", error);
		}
	};

	// Edit Course Functions
	const handleEditClick = (course) => {
		setEditingCourse(course);
		setEditingCourseName(course.courseName);
		setEditingCourseCode(course.courseCode);
		setEditingLecturer(course.lecturer ? course.lecturer._id : "");
	};

	const handleEditCancel = () => {
		setEditingCourse(null);
		setEditingCourseName("");
		setEditingCourseCode("");
		setEditingLecturer("");
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		if (!editingCourseName.trim() || !editingCourseCode.trim()) {
			toast.error("Course Name and Course Code are required.");
			return;
		}

		const updatedCourse = {
			courseName: editingCourseName.trim(),
			courseCode: editingCourseCode.trim(),
			lecturer: editingLecturer || null,
		};

		try {
			await updateCourse(editingCourse._id, updatedCourse);
			toast.success("Course updated successfully!");
			setEditingCourse(null);
			setEditingCourseName("");
			setEditingCourseCode("");
			setEditingLecturer("");
			fetchCourses();
		} catch (error) {
			toast.error("Failed to update course.");
			console.error("Course update error:", error);
		}
	};

	return (
		<div className="w-full grid grid-cols-1 gap-16">
			{/* Form to create a new course */}
			<div className="w-full max-w-[800px] mx-auto p-6 bg-white shadow rounded">
				<h2 className="text-2xl font-bold mb-4">Create Course</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="courseName"
							className="block text-gray-700"
						>
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
						<label
							htmlFor="courseCode"
							className="block text-gray-700"
						>
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
						<label
							htmlFor="lecturer"
							className="block text-gray-700"
						>
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
			</div>

			{/* Existing Courses List */}
			<div className="w-full mx-auto p-6 bg-white shadow rounded">
				<h3 className="text-xl font-semibold mt-8 mb-4">
					Existing Courses
				</h3>
				{courses.length === 0 ? (
					<p>No courses found.</p>
				) : (
					<table className="min-w-full divide-y divide-gray-200 mt-4">
						<thead>
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Course Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Course Code
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Lecturer
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{courses.map((course) => (
								<tr key={course._id}>
									<td className="px-6 py-4 whitespace-nowrap">
										{course.courseName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{course.courseCode}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{course.lecturer
											? `${course.lecturer.name} (${course.lecturer.email})`
											: "No lecturer assigned"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<button
											onClick={() =>
												handleEditClick(course)
											}
											className="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600 transition duration-200"
										>
											Edit
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{/* Edit Course Modal */}
			{editingCourse && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white p-6 rounded shadow max-w-[800px] w-full">
						<h3 className="text-xl font-semibold mb-4">
							Edit Course
						</h3>
						<form onSubmit={handleEditSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="editingCourseName"
									className="block text-gray-700 mb-1"
								>
									Course Name
								</label>
								<input
									id="editingCourseName"
									type="text"
									placeholder="Enter course name"
									value={editingCourseName}
									onChange={(e) =>
										setEditingCourseName(e.target.value)
									}
									className="w-full border p-2 rounded"
									required
								/>
							</div>
							<div>
								<label
									htmlFor="editingCourseCode"
									className="block text-gray-700 mb-1"
								>
									Course Code
								</label>
								<input
									id="editingCourseCode"
									type="text"
									placeholder="Enter course code"
									value={editingCourseCode}
									onChange={(e) =>
										setEditingCourseCode(e.target.value)
									}
									className="w-full border p-2 rounded"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="editingLecturer"
									className="block text-gray-700 mb-1"
								>
									Lecturer
								</label>
								<select
									id="editingLecturer"
									value={editingLecturer}
									onChange={(e) =>
										setEditingLecturer(e.target.value)
									}
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

							<div className="flex space-x-4">
								<button
									type="button"
									onClick={handleEditCancel}
									className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Courses;
