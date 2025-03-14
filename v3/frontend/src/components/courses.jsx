// src/components/CourseCreation.jsx
import React, { useState, useEffect } from "react";
import {
	addCourse,
	getLecturers,
	getCourses,
	updateCourse,
	deleteCourse,
} from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Courses = () => {
	const [courseName, setCourseName] = useState("");
	const [courseCode, setCourseCode] = useState("");
	const [level, setLevel] = useState("");
	const [semester, setSemester] = useState("");
	const [lecturer, setLecturer] = useState("");
	const [lecturers, setLecturers] = useState([]);
	const [courses, setCourses] = useState([]);

	const [editingCourse, setEditingCourse] = useState(null);
	const [editingCourseName, setEditingCourseName] = useState("");
	const [editingLevel, setEditingLevel] = useState("");
	const [editingSemester, setEditingSemester] = useState("");
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
			level: level.trim(),
			semester: semester.trim(),
			lecturer: lecturer || null,
		};

		try {
			await addCourse(newCourse);
			toast.success("Course created successfully!");
			setCourseName("");
			setCourseCode("");
			setLevel("");
			setSemester("");
			setLecturer("");
			fetchCourses();
		} catch (error) {
			toast.error("Failed to create course.");
			console.error("Course creation error:", error);
		}
	};

	const handleEditClick = (course) => {
		setEditingCourse(course);
		setEditingCourseName(course.courseName);
		setEditingCourseCode(course.courseCode);
		setEditingLevel(course.level);
		setEditingSemester(course.semester);
		setEditingLecturer(course.lecturer ? course.lecturer._id : "");
	};

	const handleEditCancel = () => {
		setEditingCourse(null);
		setEditingCourseName("");
		setEditingCourseCode("");
		setEditingLevel("");
		setEditingSemester("");
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
			level: editingLevel.trim(),
			semester: editingSemester.trim(),
			lecturer: editingLecturer || null,
		};

		try {
			await updateCourse(editingCourse._id, updatedCourse);
			toast.success("Course updated successfully!");
			handleEditCancel();
			fetchCourses();
		} catch (error) {
			toast.error("Failed to update course.");
			console.error("Course update error:", error);
		}
	};

	const handleDeleteCourse = async (courseId) => {
		try {
			await deleteCourse(courseId);
			toast.success("Course deleted successfully!");
			fetchCourses();
		} catch (error) {
			toast.error("Failed to delete course.");
			console.error("Course deletion error:", error);
		}
	};

	return (
		<div className="w-full grid grid-cols-1 gap-16">
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
								<th>Course Name</th>
								<th>Course Code</th>
								<th>Lecturer</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{courses.map((course) => (
								<tr key={course._id}>
									<td>{course.courseName}</td>
									<td>{course.courseCode}</td>
									<td>
										{course.lecturer
											? `${course.lecturer.name}`
											: "No lecturer assigned"}
									</td>
									<td>
										<button
											onClick={() =>
												handleEditClick(course)
											}
											className="bg-yellow-500 text-white py-1 px-2 rounded mr-2"
										>
											Edit
										</button>
										<button
											onClick={() =>
												handleDeleteCourse(course._id)
											}
											className="bg-red-500 text-white py-1 px-2 rounded"
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Courses;
