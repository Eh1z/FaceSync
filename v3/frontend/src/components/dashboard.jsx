import React, { useState, useEffect } from "react";
import {
	getStudents,
	getAttendance,
	getAttendanceRatio,
	getRecentActivity,
	getAttendanceTrends,
	getUpcomingCourses,
} from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chart from "chart.js/auto"; // Import chart library

const Dashboard = () => {
	const [students, setStudents] = useState(0);
	const [attendance, setAttendance] = useState(0);
	const [attendanceRatio, setAttendanceRatio] = useState(0);
	const [recentActivity, setRecentActivity] = useState([]);
	const [attendanceTrends, setAttendanceTrends] = useState([]);
	const [upcomingCourses, setUpcomingCourses] = useState([]);

	// Fetch data on component mount
	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const studentData = await getStudents();
			setStudents(studentData.data.totalStudents);

			const attendanceData = await getAttendance();
			setAttendance(attendanceData.data.length);

			const ratioData = await getAttendanceRatio();
			setAttendanceRatio(ratioData.data.ratio);

			const trendsData = await getAttendanceTrends();
			setAttendanceTrends(trendsData);
		} catch (error) {
			toast.error("Failed to fetch dashboard data");
		}
	};

	// Chart for Attendance Trends
	useEffect(() => {
		if (attendanceTrends.data) {
			const ctx = document
				.getElementById("attendanceTrendsChart")
				.getContext("2d");

			// Destroy the previous chart if it exists
			if (window.attendanceChart) {
				window.attendanceChart.destroy();
			}

			// Create new chart instance
			window.attendanceChart = new Chart(ctx, {
				type: "line",
				data: {
					labels: attendanceTrends.data.map(
						(trend) => `Month ${trend._id}`
					),
					datasets: [
						{
							label: "Attendance",
							data: attendanceTrends.data.map(
								(trend) => trend.totalAttendance
							),
							fill: false,
							borderColor: "rgba(75,192,192,1)",
							tension: 0.1,
						},
					],
				},
				options: {
					scales: {
						y: {
							beginAtZero: true,
						},
					},
				},
			});
		}
	}, [attendanceTrends]); // Re-run the chart rendering when attendanceTrends changes

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-800 mb-6">
					Dashboard
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					{/* Total Students */}
					<div className="bg-white shadow-md rounded-lg p-6">
						<h2 className="text-xl font-semibold text-gray-700">
							Total Students
						</h2>
						<p className="text-4xl font-bold text-blue-600 mt-4">
							{students || 0}
						</p>
					</div>
					{/* Total Attendance */}
					<div className="bg-white shadow-md rounded-lg p-6">
						<h2 className="text-xl font-semibold text-gray-700">
							Total Attendance
						</h2>
						<p className="text-4xl font-bold text-green-600 mt-4">
							{attendance || 0}
						</p>
					</div>
					{/* Attendance/Student Ratio */}
					<div className="bg-white shadow-md rounded-lg p-6">
						<h2 className="text-xl font-semibold text-gray-700">
							Attendance/Student Ratio
						</h2>
						<p className="text-4xl font-bold text-purple-600 mt-4">
							{attendanceRatio || 0}
						</p>
					</div>
				</div>

				{/* Attendance Trends */}
				<div className="bg-white shadow-md rounded-lg p-6 mb-6">
					<h2 className="text-2xl font-semibold text-gray-700 mb-4">
						Attendance Trends
					</h2>
					<canvas
						id="attendanceTrendsChart"
						className="h-64"
					></canvas>
				</div>
			</div>

			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Dashboard;
