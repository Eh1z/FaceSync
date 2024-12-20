// src/components/ExportDropdown.jsx
import React from "react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ExportDropdown = ({ data }) => {
	// Define CSV headers
	const headers = [
		{ label: "User Name", key: "user.name" },
		{ label: "Email", key: "user.email" },
		{ label: "Timestamp", key: "timestamp" },
	];

	// Function to export data as PDF
	const exportPDF = () => {
		const doc = new jsPDF();

		doc.text("Attendance Report", 14, 16);
		doc.setFontSize(12);
		const tableColumn = ["User Name", "Email", "Timestamp"];
		const tableRows = [];

		data.forEach((record) => {
			const recordData = [
				record.user?.name || "Unknown",
				record.user?.email || "Unknown",
				new Date(record.timestamp).toLocaleString(),
			];
			tableRows.push(recordData);
		});

		doc.autoTable(tableColumn, tableRows, { startY: 20 });
		doc.save("attendance_report.pdf");
	};

	return (
		<div className="relative inline-block text-left">
			<div>
				<button
					type="button"
					className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
					id="options-menu"
					aria-haspopup="true"
					aria-expanded="true"
				>
					Export Attendance
					{/* Chevron Down Icon */}
					<svg
						className="-mr-1 ml-2 h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			</div>

			{/* Dropdown Menu */}
			<div
				className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10"
				role="menu"
				aria-orientation="vertical"
				aria-labelledby="options-menu"
			>
				<div className="py-1" role="none">
					{/* CSV Export */}
					<CSVLink
						data={data}
						headers={headers}
						filename={"attendance_report.csv"}
						className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
						role="menuitem"
					>
						Export as CSV
					</CSVLink>

					{/* PDF Export */}
					<button
						onClick={exportPDF}
						className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
						role="menuitem"
					>
						Export as PDF
					</button>
				</div>
			</div>
		</div>
	);
};

export default ExportDropdown;
