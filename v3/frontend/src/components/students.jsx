import React, { useState, useEffect } from "react";
import { getUsers, addUser, updateUser, deleteUser } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Students = () => {
	// State variables
	const [knownFaces, setKnownFaces] = useState([]);

	// States for editing student
	const [editingStudent, setEditingStudent] = useState(null);
	const [editingName, setEditingName] = useState("");
	const [editingEmail, setEditingEmail] = useState("");
	const [editingStudentId, setEditingStudentId] = useState("");
	const [editingMatNum, setEditingMatNum] = useState("");
	const [editingUserImage, setEditingUserImage] = useState("");
	const [editingCourses, setEditingCourses] = useState(""); // comma separated string

	// Function to fetch all users
	const fetchUsers = async () => {
		try {
			const response = await getUsers();
			setKnownFaces(response.data);
		} catch (err) {
			console.error("Error fetching users:", err);
			toast.error("Failed to fetch users.");
		}
	};

	// Function to handle CSV file upload and process each row
	const handleCSVUpload = (event) => {
		const file = event.target.files[0];
		if (file) {
			Papa.parse(file, {
				complete: async (result) => {
					const data = result.data;
					// Loop through each row in the CSV
					for (let row of data) {
						// Prepare user data according to the schema
						const user = {
							name: row.name,
							email: row.email,
							studentId: row.studentId,
							mat_num: row.mat_num,
							userImage: row.userImage || "",
							courses: row.courses ? row.courses.split(",") : [],
						};

						try {
							// Send each user data to the backend
							await addUser(user);
							toast.success(
								`User ${user.name} added successfully.`
							);
						} catch (err) {
							console.error("Error adding user:", err);
							toast.error(`Failed to add user ${user.name}`);
						}
					}
					// Re-fetch users after import
					fetchUsers();
				},
				header: true,
				skipEmptyLines: true,
			});
		}
	};

	// CSV export configuration (excluding courses)
	const csvHeaders = [
		{ label: "Name", key: "name" },
		{ label: "Email", key: "email" },
		{ label: "Student ID", key: "studentId" },
		{ label: "Mat Num", key: "mat_num" },
	];

	// Transform the knownFaces data for CSV export (excluding courses)
	const exportData = knownFaces.map((record) => ({
		name: record.name,
		email: record.email,
		studentId: record.studentId,
		mat_num: record.mat_num,
	}));

	// Function to export the student list as a PDF (excluding courses)
	const exportPDF = () => {
		const doc = new jsPDF();
		const tableColumn = ["Name", "Email", "Student ID", "Mat Num"];
		const tableRows = [];

		knownFaces.forEach((record) => {
			const rowData = [
				record.name,
				record.email,
				record.studentId,
				record.mat_num,
			];
			tableRows.push(rowData);
		});

		// Add title
		doc.text("Student List", 14, 15);

		// Use autoTable on the doc instance
		doc.autoTable({
			head: [tableColumn],
			body: tableRows,
			startY: 20,
		});

		doc.save("student_list.pdf");
	};

	// Handle Edit Click: populate modal fields with the selected student's data
	const handleEditStudentClick = (student) => {
		setEditingStudent(student);
		setEditingName(student.name);
		setEditingEmail(student.email);
		setEditingStudentId(student.studentId);
		setEditingMatNum(student.mat_num);
		setEditingUserImage(student.userImage);
		// Convert courses array to comma separated string (if available)
		setEditingCourses(
			student.courses && student.courses.length
				? student.courses.join(", ")
				: ""
		);
	};

	// Handle Edit Cancel: reset editing state
	const handleEditStudentCancel = () => {
		setEditingStudent(null);
		setEditingName("");
		setEditingEmail("");
		setEditingStudentId("");
		setEditingMatNum("");
		setEditingUserImage("");
		setEditingCourses("");
	};

	// Handle Edit Submit: send updated student data to the backend
	const handleEditStudentSubmit = async (e) => {
		e.preventDefault();
		if (
			!editingName.trim() ||
			!editingEmail.trim() ||
			!editingStudentId.trim() ||
			!editingMatNum.trim()
		) {
			toast.error("Name, Email, Student ID, and Mat Num are required.");
			return;
		}
		const updatedStudent = {
			name: editingName.trim(),
			email: editingEmail.trim(),
			studentId: editingStudentId.trim(),
			mat_num: editingMatNum.trim(),
			userImage: editingUserImage.trim(),
			courses: editingCourses
				? editingCourses.split(",").map((course) => course.trim())
				: [],
		};
		try {
			await updateUser(editingStudent._id, updatedStudent);
			toast.success("Student updated successfully!");
			handleEditStudentCancel();
			fetchUsers();
		} catch (error) {
			console.error("Error updating student:", error);
			toast.error("Failed to update student.");
		}
	};

	// Handle Delete Student
	const handleDeleteStudent = async (studentId) => {
		try {
			await deleteUser(studentId);
			toast.success("Student deleted successfully!");
			fetchUsers();
		} catch (error) {
			console.error("Error deleting student:", error);
			toast.error("Failed to delete student.");
		}
	};

	// Fetch user records on component mount
	useEffect(() => {
		fetchUsers();
	}, []);

	return (
		<div className="w-full">
			<section className="w-full">
				<h2 className="text-2xl font-semibold mb-4 text-gray-700">
					Student List
				</h2>
				<div className="bg-white shadow rounded p-4">
					{/* CSV File Upload */}
					<input
						type="file"
						accept=".csv"
						onChange={handleCSVUpload}
						className="mb-4 p-2 border border-gray-300 rounded"
					/>

					{/* Export Buttons */}
					<div className="flex justify-end mb-4">
						<CSVLink
							data={exportData}
							headers={csvHeaders}
							filename="student_list.csv"
							className="mr-2 bg-blue-500 text-white px-4 py-2 rounded"
						>
							Export as CSV
						</CSVLink>
						<button
							onClick={exportPDF}
							className="bg-red-500 text-white px-4 py-2 rounded"
						>
							Export as PDF
						</button>
					</div>

					{knownFaces.length === 0 ? (
						<p className="text-center text-gray-500">
							No student records yet.
						</p>
					) : (
						<table className="min-w-full table-auto">
							<thead>
								<tr>
									<th className="px-4 py-2 border">Name</th>
									<th className="px-4 py-2 border">Email</th>
									<th className="px-4 py-2 border">
										Student ID
									</th>
									<th className="px-4 py-2 border">
										Mat Num
									</th>
									<th className="px-4 py-2 border">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{knownFaces.map((record, index) => (
									<tr key={record._id || index}>
										<td className="px-4 py-2 border">
											{record.name}
										</td>
										<td className="px-4 py-2 border">
											{record.email}
										</td>
										<td className="px-4 py-2 border">
											{record.studentId}
										</td>
										<td className="px-4 py-2 border">
											{record.mat_num}
										</td>
										<td className="px-4 py-2 border">
											<button
												onClick={() =>
													handleEditStudentClick(
														record
													)
												}
												className="bg-yellow-500 text-white py-1 px-2 rounded mr-2"
											>
												Edit
											</button>
											<button
												onClick={() =>
													handleDeleteStudent(
														record._id
													)
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
			</section>

			{/* Edit Modal */}
			{editingStudent && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white p-6 rounded shadow max-w-lg w-full">
						<h3 className="text-xl font-semibold mb-4">
							Edit Student
						</h3>
						<form
							onSubmit={handleEditStudentSubmit}
							className="space-y-4"
						>
							<div>
								<label className="block text-gray-700 mb-1">
									Name
								</label>
								<input
									type="text"
									value={editingName}
									onChange={(e) =>
										setEditingName(e.target.value)
									}
									className="w-full border p-2 rounded"
									required
								/>
							</div>
							<div>
								<label className="block text-gray-700 mb-1">
									Email
								</label>
								<input
									type="email"
									value={editingEmail}
									onChange={(e) =>
										setEditingEmail(e.target.value)
									}
									className="w-full border p-2 rounded"
									required
								/>
							</div>
							<div>
								<label className="block text-gray-700 mb-1">
									Student ID
								</label>
								<input
									type="text"
									value={editingStudentId}
									onChange={(e) =>
										setEditingStudentId(e.target.value)
									}
									className="w-full border p-2 rounded"
									required
								/>
							</div>
							<div>
								<label className="block text-gray-700 mb-1">
									Mat Num
								</label>
								<input
									type="text"
									value={editingMatNum}
									onChange={(e) =>
										setEditingMatNum(e.target.value)
									}
									className="w-full border p-2 rounded"
									required
								/>
							</div>
							<div>
								<label className="block text-gray-700 mb-1">
									User Image URL
								</label>
								<input
									type="text"
									value={editingUserImage}
									onChange={(e) =>
										setEditingUserImage(e.target.value)
									}
									className="w-full border p-2 rounded"
								/>
							</div>
							<div>
								<label className="block text-gray-700 mb-1">
									Courses (comma separated)
								</label>
								<input
									type="text"
									value={editingCourses}
									onChange={(e) =>
										setEditingCourses(e.target.value)
									}
									className="w-full border p-2 rounded"
								/>
							</div>
							<div className="flex justify-end space-x-4">
								<button
									type="button"
									onClick={handleEditStudentCancel}
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

export default Students;
