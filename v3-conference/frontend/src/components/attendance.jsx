import React, { useState, useEffect } from "react";
import CheckIn from "../components/CheckIn";
import { aauLogo } from "./logo";
import {
	getSessions,
	createSessionAttendanceList,
	updateAttendeeAttendance,
} from "../api";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv"; // For CSV export
import jsPDF from "jspdf"; // For PDF export
import "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "./LoadingSpinner";

const Attendance = () => {
	// State variables
	const [sessions, setSessions] = useState([]);
	const [selectedSession, setSelectedSession] = useState(null);
	const [attendance, setAttendance] = useState([]);
	const [attendeeId, setAttendeeId] = useState(null);
	const [createNewSessionAttendance, setCreateNewSessionAttendance] =
		useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch available sessions
	const fetchSessions = async () => {
		try {
			const response = await getSessions();
			setSessions(response.data);
		} catch (err) {
			console.error("Error fetching sessions:", err);
			toast.error("Failed to fetch sessions.");
		}
	};

	// Fetch attendance for selected session
	const fetchAttendance = async () => {
		if (selectedSession) {
			try {
				setIsLoading(true);
				const response = await getAttendance(selectedSession);
				setAttendance(response.data);
				setIsLoading(false);
			} catch (err) {
				toast.error("Failed to fetch attendance records.");
				console.log(err);
			}
		}
	};

	// Handle PDF export for session attendance
	const handleExportPDF = () => {
		const doc = new jsPDF();

		const tableColumn = ["Name", "Phone", "Status"];
		const tableRows = [];

		attendance[0]?.attendees.forEach((record) => {
			const rowData = [
				record.attendee?.name,
				record.attendee?.phone,
				record.status,
			];
			tableRows.push(rowData);
		});

		// Add logo
		const logo = aauLogo; // Replace with your Base64 string photo export
		doc.addImage(logo, "PNG", 15, 10, 40, 10); // Adjust x, y, width, height

		// Add title and session
		doc.setFontSize(12);
		doc.setFont("helvetica", "bold");
		doc.text("CONFERENCE SESSION ATTENDANCE", 15, 30);
		doc.setFont("helvetica", "normal");
		doc.text(`Session:  ${attendance[0].name || "Not Assigned"}`, 15, 50);

		// Use autoTable to add the table
		doc.autoTable({
			head: [tableColumn],
			body: tableRows,
			startY: 60,
		});

		doc.save(`${attendance[0].name}_attendance_list.pdf`);
	};

	// Fetch attendance when selectedSession changes
	useEffect(() => {
		fetchAttendance();
	}, [selectedSession]);

	// Fetch sessions when the component mounts
	useEffect(() => {
		fetchSessions();
	}, []);

	// Handle creating a new session attendance list
	useEffect(() => {
		if (createNewSessionAttendance) {
			const handleCreateAttendance = async () => {
				await createSessionAttendanceList(selectedSession);
				fetchAttendance();
			};
			handleCreateAttendance();
		}
	}, [createNewSessionAttendance]);

	// Fetch attendance when a user checks in
	useEffect(() => {
		const revalidateAttendance = async () => {
			await updateAttendeeAttendance(attendeeId, selectedSession);
			fetchAttendance();
		};

		revalidateAttendance();
	}, [attendeeId, selectedSession]);

	return (
		<div className="grid w-full grid-cols-5 gap-5 rounded-xl">
			<div className="w-full col-span-2">
				<h2 className="mb-4 text-2xl font-semibold text-gray-700">
					Conference Session Check-In
				</h2>
				<div className="mb-4">
					{/* Session selection */}
					<select
						value={selectedSession}
						onChange={(e) => setSelectedSession(e.target.value)}
						className="p-2 mr-4 border rounded"
					>
						<option value="">Select Session</option>
						{sessions.map((session) => (
							<option key={session._id} value={session._id}>
								{session.name}
							</option>
						))}
					</select>

					{/* Create new session attendance list */}
					<button
						onClick={() => setCreateNewSessionAttendance(true)}
						className="p-2 ml-4 text-white bg-blue-500 rounded"
					>
						Create Attendance List
					</button>
				</div>

				{/* Check-in Component */}
				<CheckIn
					onMarkAttendance={fetchAttendance}
					setAttendeeId={setAttendeeId}
					attendeeId={attendeeId}
				/>
			</div>

			<section className="w-full col-span-3">
				<h2 className="mb-4 text-2xl font-semibold text-gray-700">
					{selectedSession
						? `${selectedSession} Attendance List`
						: "Attendance List"}
				</h2>

				<div className="p-4 bg-white rounded-lg shadow">
					{isLoading ? (
						<div className="flex items-center justify-center w-full">
							<LoadingSpinner />
						</div>
					) : (
						<div>
							{attendance.length === 0 ? (
								<p className="text-center text-gray-500">
									No attendance records yet.
								</p>
							) : (
								<div className="w-full">
									<div className="flex justify-end mb-4">
										<button
											onClick={handleExportPDF}
											className="px-4 py-2 mr-4 text-white bg-green-500 rounded-md hover:bg-green-600"
										>
											Export to PDF
										</button>
										<CSVLink
											data={attendance[0]?.attendees.map(
												(record) => [
													record.attendee?.name,
													record.attendee?.phone,
													record.status,
												]
											)}
											filename="attendance.csv"
										>
											<button className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
												Export to CSV
											</button>
										</CSVLink>
									</div>

									<table className="w-full border border-collapse border-gray-300 table-auto">
										<thead>
											<tr className="text-left">
												<th className="p-2 border-b">
													Attendee
												</th>
												<th className="p-2 border-b">
													Phone
												</th>
												<th className="p-2 border-b">
													Status
												</th>
											</tr>
										</thead>
										<tbody>
											{attendance[0]?.attendees.map(
												(record) => (
													<tr
														key={record._id}
														className="hover:bg-gray-100"
													>
														<td className="p-2 border-b">
															{
																record.attendee
																	?.name
															}
														</td>
														<td className="p-2 border-b">
															{
																record.attendee
																	?.phone
															}
														</td>
														<td className="p-2 border-b">
															{record.status}
														</td>
													</tr>
												)
											)}
										</tbody>
									</table>
								</div>
							)}
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default Attendance;
