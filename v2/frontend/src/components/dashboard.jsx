import React from "react";

const Dashboard = () => {
	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-800 mb-6">
					Dashboard
				</h1>
				<p className="text-gray-600 mb-6">
					Get insights into student metrics, attendance trends, and
					system performance.
				</p>

				{/* Metrics Overview */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div className="bg-white shadow-md rounded-lg p-6">
						<h2 className="text-xl font-semibold text-gray-700">
							Total Students
						</h2>
						<p className="text-4xl font-bold text-blue-600 mt-4">
							120
						</p>
					</div>
					<div className="bg-white shadow-md rounded-lg p-6">
						<h2 className="text-xl font-semibold text-gray-700">
							Total Attendance
						</h2>
						<p className="text-4xl font-bold text-green-600 mt-4">
							3,450
						</p>
					</div>
					<div className="bg-white shadow-md rounded-lg p-6">
						<h2 className="text-xl font-semibold text-gray-700">
							Attendance/Student Ratio
						</h2>
						<p className="text-4xl font-bold text-purple-600 mt-4">
							28.75
						</p>
					</div>
				</div>

				{/* Attendance Trends */}
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h2 className="text-2xl font-semibold text-gray-700 mb-4">
						Attendance Trends
					</h2>
					<p className="text-gray-600">
						Placeholder for a chart or graph to display attendance
						trends over time.
					</p>
					<div className="h-40 bg-gray-200 flex items-center justify-center rounded-lg">
						<span className="text-gray-500">Graph Placeholder</span>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="bg-white shadow-md rounded-lg p-6">
					<h2 className="text-2xl font-semibold text-gray-700 mb-4">
						Recent Activity
					</h2>
					<ul className="space-y-4">
						<li className="flex justify-between items-center">
							<div>
								<p className="text-gray-800 font-medium">
									John Doe
								</p>
								<p className="text-gray-600 text-sm">
									Marked present on 2025-01-11
								</p>
							</div>
							<span className="text-green-600 font-semibold">
								Present
							</span>
						</li>
						<li className="flex justify-between items-center">
							<div>
								<p className="text-gray-800 font-medium">
									Jane Smith
								</p>
								<p className="text-gray-600 text-sm">
									Marked absent on 2025-01-11
								</p>
							</div>
							<span className="text-red-600 font-semibold">
								Absent
							</span>
						</li>
						<li className="flex justify-between items-center">
							<div>
								<p className="text-gray-800 font-medium">
									Alice Johnson
								</p>
								<p className="text-gray-600 text-sm">
									Marked present on 2025-01-11
								</p>
							</div>
							<span className="text-green-600 font-semibold">
								Present
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
