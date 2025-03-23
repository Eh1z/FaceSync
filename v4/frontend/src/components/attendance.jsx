import React, { useState, useEffect } from "react";
import CheckIn from "../components/CheckIn";
import { aauLogo } from "./logo";
import {
	getAttendance,
	getCourses,
	createAttendanceList,
	updateStudentAttendance,
} from "../api";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv"; // For CSV export
import jsPDF from "jspdf"; // For PDF export
import "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "./LoadingSpinner";

const Attendance = () => {
	const [levels] = useState(["100L", "200L", "300L", "400L", "500L"]);
	const [semesters] = useState(["first", "second"]);
	const [selectedLevel, setSelectedLevel] = useState("");
	const [selectedSemester, setSelectedSemester] = useState("");
	const [courses, setCourses] = useState([]);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [attendance, setAttendance] = useState([]);
	const [studentId, setStudentId] = useState(null);
	const [lecturer, setLecturer] = useState(null); // Add state for the lecturer
	const [createNewAttendance, setCreateNewAttendance] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch courses based on selected level and semester
	const fetchCourses = async () => {
		if (selectedLevel && selectedSemester) {
			try {
				const response = await getCourses(
					selectedLevel,
					selectedSemester
				);
				setCourses(response.data);
			} catch (err) {
				console.error("Error fetching courses:", err);
				toast.error("Failed to fetch courses.");
			}
		}
	};

	// Fetch attendance based on the selected course
	const fetchAttendance = async () => {
		if (selectedCourse) {
			try {
				setIsLoading(true);
				const response = await getAttendance();
				setAttendance(response.data);
				setIsLoading(false);
			} catch (err) {
				toast.error("Failed to fetch attendance records.");
				console.log(err);
			}
		}
	};

	// Handle PDF export
	const handleExportPDF = () => {
		const doc = new jsPDF();

		const tableColumn = ["Name", "Mat. Number", "Status"];
		const tableRows = [];

		attendance[0]?.students.forEach((record) => {
			const rowData = [
				record.student?.name,
				record.student?.mat_num,
				record.status,
			];
			tableRows.push(rowData);
		});

		// Add logo
		const logo = aauLogo; // Replace with your Base64 string photo export
		doc.addImage(logo, "PNG", 15, 10, 40, 10); // Adjust x, y, width, height

		// Add title and lecturer
		doc.setFontSize(12);
		doc.setFont("helvetica", "bold");
		doc.text("FACULTY OF PHYSICAL SCIENCES", 15, 30);
		doc.text("DEPARTMENT OF COMPUTER SCIENCE", 15, 35);
		doc.setFont("helvetica", "normal");
		doc.text("CLASS ATTENDANCE LIST", 15, 50);
		doc.text(`Course:  ${attendance[0].name || "Not Assigned"}`, 15, 55);
		doc.text(`Lecturer:  ${lecturer?.name || "Not Assigned"}`, 15, 60);

		// Use autoTable to add the table
		doc.autoTable({
			head: [tableColumn],
			body: tableRows,
			startY: 70,
		});

		doc.save(`${attendance[0].name}_attendance_list.pdf`);
	};

	// When a course is selected, set the lecturer for that course
	useEffect(() => {
		if (selectedCourse && courses.length > 0) {
			const course = courses.find(
				(course) => course.courseCode === selectedCourse
			);
			if (course) {
				setLecturer(course.lecturer); // Assuming lecturer is part of the course object
			}
		}
	}, [selectedCourse, courses]);

	// Fetch attendance when selectedCourse changes
	useEffect(() => {
		fetchAttendance();
	}, [selectedCourse]);

	// Fetch courses when selectedLevel or selectedSemester changes
	useEffect(() => {
		fetchCourses();
	}, [selectedLevel, selectedSemester]);

	// Fetch attendance when new List is created
	useEffect(() => {
		if (createNewAttendance) {
			const handleCreateAttendance = async () => {
				await createAttendanceList(selectedCourse);
				fetchAttendance();
			};
			handleCreateAttendance();
		}
	}, [createNewAttendance]);

	// Fetch attendance when a student checks in
	useEffect(() => {
		const revalidateAttendance = async () => {
			await updateStudentAttendance(studentId, selectedCourse);
			fetchAttendance();
		};

		revalidateAttendance();
	}, [studentId, selectedCourse]);

	return (
		<div className="w-full rounded-xl grid grid-cols-5 gap-5">
			<div className="w-full col-span-2">
				<h2 className="text-2xl font-semibold mb-4 text-gray-700">
					Attendance Check-In
				</h2>
				<div className="mb-4">
					<select
						value={selectedLevel}
						onChange={(e) => setSelectedLevel(e.target.value)}
						className="mr-4 p-2 border rounded"
					>
						<option value="">Select Level</option>
						{levels.map((level) => (
							<option key={level} value={level}>
								{level}
							</option>
						))}
					</select>
					<select
						value={selectedSemester}
						onChange={(e) => setSelectedSemester(e.target.value)}
						className="mr-4 p-2 border rounded"
					>
						<option value="">Select Semester</option>
						{semesters.map((semester) => (
							<option key={semester} value={semester}>
								{semester}
							</option>
						))}
					</select>
					<select
						value={selectedCourse}
						onChange={(e) => setSelectedCourse(e.target.value)}
						className="p-2 border rounded"
					>
						<option value="">Select Course</option>
						{courses.map((course) => (
							<option key={course._id} value={course.courseCode}>
								{course.courseName}
							</option>
						))}
					</select>
					<button
						onClick={() => setCreateNewAttendance(true)}
						className="ml-4 p-2 bg-blue-500 text-white rounded"
					>
						Create Attendance List
					</button>
				</div>
				<CheckIn
					onMarkAttendance={fetchAttendance}
					setStudentId={setStudentId}
					studentId={studentId}
				/>
			</div>

			<section className="w-full col-span-3">
				<h2 className="text-2xl font-semibold text-gray-700 mb-4">
					{selectedCourse
						? `${selectedCourse} Attendance List`
						: "Attendance List"}
				</h2>

				<div className="bg-white shadow rounded-lg p-4">
					{isLoading ? (
						<div className="w-full flex justify-center items-center">
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
											className="bg-green-500 text-white py-2 px-4 rounded-md mr-4 hover:bg-green-600"
										>
											Export to PDF
										</button>
										<CSVLink
											data={attendance[0]?.students.map(
												(record) => [
													record.student?.name,
													record.student?.mat_num,
													record.status,
												]
											)}
											filename="attendance.csv"
										>
											<button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
												Export to CSV
											</button>
										</CSVLink>
									</div>

									<table className="w-full table-auto border-collapse border border-gray-300">
										<thead>
											<tr className="text-left">
												<th className="border-b p-2">
													Student
												</th>
												<th className="border-b p-2">
													Mat. Number
												</th>
												<th className="border-b p-2">
													Status
												</th>
											</tr>
										</thead>
										<tbody>
											{attendance[0]?.students.map(
												(record) => (
													<tr
														key={record._id}
														className="hover:bg-gray-100"
													>
														<td className="border-b p-2">
															{
																record.student
																	?.name
															}
														</td>
														<td className="border-b p-2">
															{
																record.student
																	?.mat_num
															}
														</td>
														<td className="border-b p-2">
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
