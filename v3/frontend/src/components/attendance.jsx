import React, { useState, useEffect } from "react";
import CheckIn from "../components/CheckIn";
import ExportDropdown from "../components/ExportDropDown";
import { getAttendance, getUsers } from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Attendance = () => {
	// State variables
	const [knownFaces, setKnownFaces] = useState([]);
	const [attendance, setAttendance] = useState([]);

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

	// Function to fetch all attendance records
	const fetchAttendance = async () => {
		try {
			const response = await getAttendance();
			setAttendance(response.data);
		} catch (err) {
			console.error("Error fetching attendance records:", err);
			toast.error("Failed to fetch attendance records.");
		}
	};

	// Fetch users and attendance records on component mount
	useEffect(() => {
		fetchUsers();
		fetchAttendance();
	}, []);

	// Function to handle marking attendance
	const handleMarkAttendance = async () => {
		try {
			// This function can be used to perform additional actions after marking attendance
			fetchAttendance(); // Refresh attendance records after marking
		} catch (error) {
			console.error("Error marking attendance:", error);
			toast.error("Failed to mark attendance.");
		}
	};

	return (
		<div className="w-full h-[800px] p-5 rounded-xl grid grid-cols-2 gap-5">
			<div className="w-full">
				<h2 className="text-2xl font-semibold mb-4 text-gray-700">
					Attendance Check-In
				</h2>
				<CheckIn onMarkAttendance={handleMarkAttendance} />
			</div>
			{/* Attendance List */}
			<section className="w-full">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-semibold text-gray-700">
						Attendance List
					</h2>
					{/* Export Dropdown */}
					<ExportDropdown data={attendance} />
				</div>
				<div className="bg-white shadow rounded-lg p-4">
					{attendance.length === 0 ? (
						<p className="text-center text-gray-500">
							No attendance records yet.
						</p>
					) : (
						<table className="min-w-full leading-normal">
							<thead>
								<tr>
									<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										User Name
									</th>
									<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Email
									</th>
									<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Timestamp
									</th>
								</tr>
							</thead>
							<tbody>
								{attendance.map((record) => (
									<tr key={record._id}>
										<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
											{record.userId?.name || "Unknown"}
										</td>
										<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
											{record.userId?.email || "Unknown"}
										</td>
										<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
											{new Date(
												record.createdAt
											).toLocaleString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</section>
		</div>
	);
};

export default Attendance;
