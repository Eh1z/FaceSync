import React, { useState, useEffect } from "react";
import {
	getAttendees,
	addAttendee,
	updateAttendee,
	deleteAttendee,
} from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Attendees = () => {
	// State variables
	const [attendees, setAttendees] = useState([]);
	const [editingAttendee, setEditingAttendee] = useState(null);
	const [editingName, setEditingName] = useState("");
	const [editingEmail, setEditingEmail] = useState("");
	const [editingJob, setEditingJob] = useState("");
	const [editingPhone, setEditingPhone] = useState("");
	const [editingAge, setEditingAge] = useState("");
	const [editingUserImage, setEditingUserImage] = useState("");

	// Function to fetch all attendees
	const fetchAttendees = async () => {
		try {
			const response = await getAttendees();
			setAttendees(response.data);
		} catch (err) {
			console.error("Error fetching attendees:", err);
			toast.error("Failed to fetch attendees.");
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
						// Prepare attendee data according to the schema
						const attendee = {
							name: row.name,
							email: row.email,
							job: row.job,
							phone: row.phone,
							age: row.age,
							userImage: row.userImage || "",
						};

						try {
							// Send each attendee data to the backend
							await addAttendee(attendee);
							toast.success(
								`Attendee ${attendee.name} added successfully.`
							);
						} catch (err) {
							console.error("Error adding attendee:", err);
							toast.error(
								`Failed to add attendee ${attendee.name}`
							);
						}
					}
					// Re-fetch attendees after import
					fetchAttendees();
				},
				header: true,
				skipEmptyLines: true,
			});
		}
	};

	// CSV export configuration (without student-related fields)
	const csvHeaders = [
		{ label: "Name", key: "name" },
		{ label: "Email", key: "email" },
		{ label: "Job", key: "job" },
		{ label: "Phone", key: "phone" },
		{ label: "Age", key: "age" },
	];

	// Transform the attendees data for CSV export
	const exportData = attendees.map((record) => ({
		name: record.name,
		email: record.email,
		job: record.job,
		phone: record.phone,
		age: record.age,
	}));

	// Function to export the attendee list as a PDF
	const exportPDF = () => {
		const doc = new jsPDF();
		const tableColumn = ["Name", "Email", "Job", "Phone", "Age"];
		const tableRows = [];

		attendees.forEach((record) => {
			const rowData = [
				record.name,
				record.email,
				record.job,
				record.phone,
				record.age,
			];
			tableRows.push(rowData);
		});

		// Add title
		doc.text("Attendee List", 14, 15);

		// Use autoTable on the doc instance
		doc.autoTable({
			head: [tableColumn],
			body: tableRows,
			startY: 20,
		});

		doc.save("attendee_list.pdf");
	};

	// Handle Edit Click: populate modal fields with the selected attendee's data
	const handleEditAttendeeClick = (attendee) => {
		setEditingAttendee(attendee);
		setEditingName(attendee.name);
		setEditingEmail(attendee.email);
		setEditingJob(attendee.job);
		setEditingPhone(attendee.phone);
		setEditingAge(attendee.age);
		setEditingUserImage(attendee.userImage);
	};

	// Handle Edit Cancel: reset editing state
	const handleEditAttendeeCancel = () => {
		setEditingAttendee(null);
		setEditingName("");
		setEditingEmail("");
		setEditingJob("");
		setEditingPhone("");
		setEditingAge("");
		setEditingUserImage("");
	};

	// Handle Edit Submit: send updated attendee data to the backend
	const handleEditAttendeeSubmit = async (e) => {
		e.preventDefault();
		if (
			!editingName.trim() ||
			!editingEmail.trim() ||
			!editingJob.trim() ||
			!editingPhone.trim() ||
			!editingAge.trim()
		) {
			toast.error("All fields are required.");
			return;
		}
		const updatedAttendee = {
			name: editingName.trim(),
			email: editingEmail.trim(),
			job: editingJob.trim(),
			phone: editingPhone.trim(),
			age: editingAge.trim(),
			userImage: editingUserImage.trim(),
		};
		try {
			await updateAttendee(editingAttendee._id, updatedAttendee);
			toast.success("Attendee updated successfully!");
			handleEditAttendeeCancel();
			fetchAttendees();
		} catch (error) {
			console.error("Error updating attendee:", error);
			toast.error("Failed to update attendee.");
		}
	};

	// Handle Delete Attendee
	const handleDeleteAttendee = async (attendeeId) => {
		try {
			await deleteAttendee(attendeeId);
			toast.success("Attendee deleted successfully!");
			fetchAttendees();
		} catch (error) {
			console.error("Error deleting attendee:", error);
			toast.error("Failed to delete attendee.");
		}
	};

	// Fetch attendees on component mount
	useEffect(() => {
		fetchAttendees();
	}, []);

	return (
		<div className="w-full p-6 bg-gray-100">
			<h2 className="mb-6 text-2xl font-semibold text-gray-700">
				Manage Attendees
			</h2>

			{/* CSV File Upload */}
			<input
				type="file"
				accept=".csv"
				onChange={handleCSVUpload}
				className="p-2 mb-4 border border-gray-300 rounded"
			/>

			{/* Export Buttons */}
			<div className="flex justify-end mb-6">
				<CSVLink
					data={exportData}
					headers={csvHeaders}
					filename="attendee_list.csv"
					className="px-4 py-2 mr-2 text-white bg-blue-500 rounded"
				>
					Export as CSV
				</CSVLink>
				<button
					onClick={exportPDF}
					className="px-4 py-2 text-white bg-red-500 rounded"
				>
					Export as PDF
				</button>
			</div>

			{/* Attendee List Table */}
			{attendees.length === 0 ? (
				<p className="text-center text-gray-500">No attendees found.</p>
			) : (
				<table className="min-w-full bg-white rounded-lg shadow-md table-auto">
					<thead>
						<tr>
							<th className="px-4 py-2 border">Name</th>
							<th className="px-4 py-2 border">Email</th>
							<th className="px-4 py-2 border">Job</th>
							<th className="px-4 py-2 border">Phone</th>
							<th className="px-4 py-2 border">Age</th>
							<th className="px-4 py-2 border">Actions</th>
						</tr>
					</thead>
					<tbody>
						{attendees.map((attendee) => (
							<tr key={attendee._id}>
								<td className="px-4 py-2 border">
									{attendee.name}
								</td>
								<td className="px-4 py-2 border">
									{attendee.email}
								</td>
								<td className="px-4 py-2 border">
									{attendee.job}
								</td>
								<td className="px-4 py-2 border">
									{attendee.phone}
								</td>
								<td className="px-4 py-2 border">
									{attendee.age}
								</td>
								<td className="px-4 py-2 border">
									<button
										onClick={() =>
											handleEditAttendeeClick(attendee)
										}
										className="px-2 py-1 mr-2 text-white bg-yellow-500 rounded"
									>
										Edit
									</button>
									<button
										onClick={() =>
											handleDeleteAttendee(attendee._id)
										}
										className="px-2 py-1 text-white bg-red-500 rounded"
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{/* Edit Attendee Modal */}
			{editingAttendee && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="w-full max-w-lg p-6 bg-white rounded shadow">
						<h3 className="mb-4 text-xl font-semibold">
							Edit Attendee
						</h3>
						<form
							onSubmit={handleEditAttendeeSubmit}
							className="space-y-4"
						>
							<div>
								<label className="block mb-1 text-gray-700">
									Name
								</label>
								<input
									type="text"
									value={editingName}
									onChange={(e) =>
										setEditingName(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label className="block mb-1 text-gray-700">
									Email
								</label>
								<input
									type="email"
									value={editingEmail}
									onChange={(e) =>
										setEditingEmail(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label className="block mb-1 text-gray-700">
									Job
								</label>
								<input
									type="text"
									value={editingJob}
									onChange={(e) =>
										setEditingJob(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label className="block mb-1 text-gray-700">
									Phone
								</label>
								<input
									type="text"
									value={editingPhone}
									onChange={(e) =>
										setEditingPhone(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label className="block mb-1 text-gray-700">
									Age
								</label>
								<input
									type="text"
									value={editingAge}
									onChange={(e) =>
										setEditingAge(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label className="block mb-1 text-gray-700">
									User Image URL
								</label>
								<input
									type="text"
									value={editingUserImage}
									onChange={(e) =>
										setEditingUserImage(e.target.value)
									}
									className="w-full p-2 border rounded"
								/>
							</div>
							<div className="flex justify-end space-x-4">
								<button
									type="button"
									onClick={handleEditAttendeeCancel}
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

			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Attendees;
