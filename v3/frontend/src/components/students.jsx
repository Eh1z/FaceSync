import React, { useState, useEffect } from "react";
import { getUsers, addUser } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Students = () => {
	// State variables
	const [knownFaces, setKnownFaces] = useState([]);

	// Function to fetch all users
	const fetchUsers = async () => {
		try {
			const response = await getUsers();
			setKnownFaces(response.data);
			console.log(response.data);
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
								</tr>
							</thead>
							<tbody>
								{knownFaces.map((record, index) => (
									<tr key={index}>
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
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</section>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Students;
