import React, { useState, useEffect } from "react";
import {
	getLecturers,
	addLecturer,
	getCourses,
	updateLecturer,
	deleteLecturer,
} from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Speakers = () => {
	const [lecturers, setLecturers] = useState([]);
	const [courses, setCourses] = useState([]);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [selectedCourses, setSelectedCourses] = useState([]);
	const [editingLecturer, setEditingLecturer] = useState(null);
	const [editingName, setEditingName] = useState("");
	const [editingEmail, setEditingEmail] = useState("");
	const [editingSelectedCourses, setEditingSelectedCourses] = useState([]);

	useEffect(() => {
		fetchLecturers();
		fetchCourses();
	}, []);

	const fetchLecturers = async () => {
		try {
			const response = await getLecturers();
			setLecturers(response.data);
		} catch (error) {
			toast.error("Failed to fetch lecturers.", { containerId: "A" });
			console.error(error);
		}
	};

	const fetchCourses = async () => {
		try {
			const response = await getCourses();
			setCourses(response.data);
		} catch (error) {
			toast.error("Failed to fetch courses.", { containerId: "A" });
			console.error(error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!name.trim() || !email.trim()) {
			toast.error("Name and email are required.", { containerId: "A" });
			return;
		}

		const newLecturer = {
			name: name.trim(),
			email: email.trim(),
			courses: selectedCourses,
		};

		try {
			await addLecturer(newLecturer);
			toast.success("Lecturer added successfully!", { containerId: "A" });
			setName("");
			setEmail("");
			setSelectedCourses([]);
			fetchLecturers();
		} catch (error) {
			toast.error("Failed to add lecturer.", { containerId: "A" });
			console.error(error);
		}
	};

	const handleCourseChange = (e) => {
		const selected = Array.from(
			e.target.selectedOptions,
			(option) => option.value
		);
		setSelectedCourses(selected);
	};

	const handleRemoveCourse = (courseId) => {
		setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
	};

	// Edit Lecturer Functions
	const handleEditClick = (lecturer) => {
		setEditingLecturer(lecturer);
		setEditingName(lecturer.name);
		setEditingEmail(lecturer.email);
		const courseIds = lecturer.courses
			? lecturer.courses.map((course) => course._id)
			: [];
		setEditingSelectedCourses(courseIds);
	};

	const handleEditingCourseChange = (e) => {
		const selected = Array.from(
			e.target.selectedOptions,
			(option) => option.value
		);
		setEditingSelectedCourses(selected);
	};

	const handleRemoveEditingCourse = (courseId) => {
		setEditingSelectedCourses((prev) =>
			prev.filter((id) => id !== courseId)
		);
	};

	const handleEditCancel = () => {
		setEditingLecturer(null);
		setEditingName("");
		setEditingEmail("");
		setEditingSelectedCourses([]);
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		if (!editingName.trim() || !editingEmail.trim()) {
			toast.error("Name and email are required.", { containerId: "A" });
			return;
		}
		const updatedLecturer = {
			name: editingName.trim(),
			email: editingEmail.trim(),
			courses: editingSelectedCourses,
		};
		try {
			await updateLecturer(editingLecturer._id, updatedLecturer);
			toast.success("Lecturer updated successfully!", {
				containerId: "A",
			});
			handleEditCancel();
			fetchLecturers();
		} catch (error) {
			console.error(
				"Client Update Error:",
				error.response ? error.response.data : error
			);
			toast.error("Failed to update lecturer.", { containerId: "A" });
		}
	};

	// New: Delete Lecturer function
	const handleDeleteLecturer = async (lecturerId) => {
		try {
			await deleteLecturer(lecturerId);
			toast.success("Lecturer deleted successfully!", {
				containerId: "A",
			});
			fetchLecturers();
		} catch (error) {
			toast.error("Failed to delete lecturer.", { containerId: "A" });
			console.error("Lecturer deletion error:", error);
		}
	};

	return (
		<div className="w-full p-6 mx-auto">
			{/* ToastContainer with containerId "A" */}
			<ToastContainer
				containerId="A"
				position="top-right"
				autoClose={5000}
				hideProgressBar={true}
			/>
			<h2 className="mb-4 text-2xl font-bold">Lecturers</h2>

			{/* Form to add a new lecturer */}
			<div className="max-w-[800px] bg-white p-4 rounded shadow mb-8">
				<h3 className="mb-4 text-xl font-semibold">Add New Lecturer</h3>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="lecturerName"
							className="block mb-1 text-gray-700"
						>
							Name
						</label>
						<input
							id="lecturerName"
							type="text"
							placeholder="Enter lecturer name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full p-2 border rounded"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="lecturerEmail"
							className="block mb-1 text-gray-700"
						>
							Email
						</label>
						<input
							id="lecturerEmail"
							type="email"
							placeholder="Enter lecturer email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full p-2 border rounded"
							required
						/>
					</div>

					{/* Selected Courses List */}
					{selectedCourses.length > 0 && (
						<div className="mb-4">
							<h4 className="font-semibold">Selected Courses:</h4>
							<div className="flex flex-wrap gap-2">
								{selectedCourses.map((courseId) => {
									const courseObj = courses.find(
										(course) => course._id === courseId
									);
									return (
										<div
											key={courseId}
											className="flex items-center px-2 py-1 bg-gray-200 rounded"
										>
											<span className="mr-2">
												{courseObj
													? courseObj.courseCode
													: courseId}
											</span>
											<button
												type="button"
												onClick={() =>
													handleRemoveCourse(courseId)
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

					<div>
						<label
							htmlFor="lecturerCourses"
							className="block mb-1 text-gray-700"
						>
							Assign Courses
						</label>
						<select
							id="lecturerCourses"
							multiple
							value={selectedCourses}
							onChange={handleCourseChange}
							className="w-full p-2 border rounded"
						>
							{courses.map((course) => (
								<option key={course._id} value={course._id}>
									{course.courseName} ({course.courseCode})
								</option>
							))}
						</select>
					</div>
					<button
						type="submit"
						className="px-4 py-2 text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-600"
					>
						Add Lecturer
					</button>
				</form>
			</div>

			{/* List of existing lecturers */}
			<div className="p-4 bg-white rounded shadow">
				<h3 className="mb-4 text-xl font-semibold">
					Existing Lecturers
				</h3>
				{lecturers.length === 0 ? (
					<p>No lecturers found.</p>
				) : (
					<table className="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Name
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Email
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Courses
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{lecturers.map((lecturer) => (
								<tr key={lecturer._id}>
									<td className="px-6 py-4 whitespace-nowrap">
										{lecturer.name}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{lecturer.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{lecturer.courses &&
										lecturer.courses.length > 0 ? (
											lecturer.courses.map((course) => (
												<div key={course._id}>
													{course.courseCode},
												</div>
											))
										) : (
											<span>No courses assigned</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<button
											onClick={() =>
												handleEditClick(lecturer)
											}
											className="px-2 py-1 mr-2 text-white transition duration-200 bg-yellow-500 rounded hover:bg-yellow-600"
										>
											Edit
										</button>
										<button
											onClick={() =>
												handleDeleteLecturer(
													lecturer._id
												)
											}
											className="px-2 py-1 text-white transition duration-200 bg-red-500 rounded hover:bg-red-600"
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

			{/* Edit Lecturer Modal */}
			{editingLecturer && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded shadow max-w-[800px] w-full">
						<h3 className="mb-4 text-xl font-semibold">
							Edit Lecturer
						</h3>
						<form onSubmit={handleEditSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="editingName"
									className="block mb-1 text-gray-700"
								>
									Name
								</label>
								<input
									id="editingName"
									type="text"
									placeholder="Enter lecturer name"
									value={editingName}
									onChange={(e) =>
										setEditingName(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label
									htmlFor="editingEmail"
									className="block mb-1 text-gray-700"
								>
									Email
								</label>
								<input
									id="editingEmail"
									type="email"
									placeholder="Enter lecturer email"
									value={editingEmail}
									onChange={(e) =>
										setEditingEmail(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>

							{/* Selected Courses for Editing */}
							{editingSelectedCourses.length > 0 && (
								<div className="mb-4">
									<h4 className="font-semibold">
										Selected Courses:
									</h4>
									<div className="flex flex-wrap gap-2">
										{editingSelectedCourses.map(
											(courseId) => {
												const courseObj = courses.find(
													(course) =>
														course._id === courseId
												);
												return (
													<div
														key={courseId}
														className="flex items-center px-2 py-1 bg-gray-200 rounded"
													>
														<span className="mr-2">
															{courseObj
																? courseObj.courseCode
																: courseId}
														</span>
														<button
															type="button"
															onClick={() =>
																handleRemoveEditingCourse(
																	courseId
																)
															}
															className="text-red-500"
														>
															x
														</button>
													</div>
												);
											}
										)}
									</div>
								</div>
							)}

							<div>
								<label
									htmlFor="editingCourses"
									className="block mb-1 text-gray-700"
								>
									Assign Courses
								</label>
								<select
									id="editingCourses"
									multiple
									value={editingSelectedCourses}
									onChange={handleEditingCourseChange}
									className="w-full p-2 border rounded"
								>
									{courses.map((course) => (
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
							<div className="flex space-x-4">
								<button
									type="button"
									onClick={handleEditCancel}
									className="px-4 py-2 text-white transition duration-200 bg-gray-500 rounded hover:bg-gray-600"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 text-white transition duration-200 bg-green-500 rounded hover:bg-green-600"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Speakers;
