// src/components/ExportDropdown.jsx
import React, { useState } from "react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaChevronDown } from "react-icons/fa"; // Optional: For dropdown icon

const ExportDropdown = ({ data }) => {
	const [isOpen, setIsOpen] = useState(false);

	// Define CSV headers matching the attendance data structure
	const headers = [
		{ label: "User Name", key: "userId.name" },
		{ label: "Email", key: "userId.email" },
		{ label: "Timestamp", key: "createdAt" },
	];

	// Function to export data as PDF
	const exportPDF = () => {
		try {
			const doc = new jsPDF();

			// Add title
			doc.text("Attendance Report", 14, 16);
			doc.setFontSize(12);

			// Define table columns
			const tableColumn = ["User Name", "Email", "Timestamp"];

			// Define table rows
			const tableRows = [];

			data.forEach((record) => {
				const recordData = [
					record.userId?.name || "Unknown",
					record.userId?.email || "Unknown",
					new Date(record.createdAt).toLocaleString(),
				];
				tableRows.push(recordData);
			});

			// Add table to PDF
			doc.autoTable({
				head: [tableColumn],
				body: tableRows,
				startY: 20,
			});

			// Save the PDF
			doc.save("attendance_report.pdf");
			toast.success("PDF exported successfully!");
		} catch (error) {
			console.error("Error exporting PDF:", error);
			toast.error("Failed to export PDF.");
		}
	};

	return (
		<div className="relative inline-block text-left">
			<div>
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
					id="options-menu"
					aria-haspopup="true"
					aria-expanded={isOpen}
				>
					Export Attendance
					<FaChevronDown
						className="ml-2 -mr-1 h-5 w-5"
						aria-hidden="true"
					/>
				</button>
			</div>

			{/* Dropdown Menu */}
			{isOpen && (
				<div
					className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
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
							onClick={() => setIsOpen(false)}
						>
							Export as CSV
						</CSVLink>

						{/* PDF Export */}
						<button
							onClick={() => {
								exportPDF();
								setIsOpen(false);
							}}
							className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
							role="menuitem"
						>
							Export as PDF
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ExportDropdown;
