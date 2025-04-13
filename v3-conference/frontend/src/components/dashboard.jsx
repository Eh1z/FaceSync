import React, { useState, useEffect } from "react";
import {
	getSpeakers,
	getAttendees,
	getAttendeeStats,
	getConferenceTrends,
} from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chart from "chart.js/auto"; // Import chart library

const Dashboard = () => {
	const [attendees, setAttendees] = useState(0);
	const [speakers, setSpeakers] = useState(0);
	const [attendeeStats, setAttendeeStats] = useState({});
	const [recentActivity, setRecentActivity] = useState([]);
	const [conferenceTrends, setConferenceTrends] = useState([]);

	// Fetch data on component mount
	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const attendeeData = await getAttendees();
			setAttendees(attendeeData.data.totalAttendees);

			const speakerData = await getSpeakers();
			setSpeakers(speakerData.data.totalSpeakers);

			const statsData = await getAttendeeStats();
			setAttendeeStats(statsData.data);

			const trendsData = await getConferenceTrends();
			setConferenceTrends(trendsData.data);
		} catch (error) {
			toast.error("Failed to fetch dashboard data");
		}
	};

	// Chart for Conference Trends
	useEffect(() => {
		if (conferenceTrends) {
			const ctx = document
				.getElementById("conferenceTrendsChart")
				.getContext("2d");

			// Destroy the previous chart if it exists
			if (window.conferenceChart) {
				window.conferenceChart.destroy();
			}

			// Create new chart instance
			window.conferenceChart = new Chart(ctx, {
				type: "line",
				data: {
					labels: conferenceTrends.map(
						(trend) => `Month ${trend.month}`
					),
					datasets: [
						{
							label: "Attendee Growth",
							data: conferenceTrends.map(
								(trend) => trend.attendees
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
	}, [conferenceTrends]); // Re-run the chart rendering when conferenceTrends changes

	return (
		<div className="min-h-screen p-6 bg-gray-100">
			<div className="mx-auto max-w-7xl">
				<h1 className="mb-6 text-3xl font-bold text-gray-800">
					Dashboard
				</h1>

				<div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
					{/* Total Attendees */}
					<div className="p-6 bg-white rounded-lg shadow-md">
						<h2 className="text-xl font-semibold text-gray-700">
							Total Attendees
						</h2>
						<p className="mt-4 text-4xl font-bold text-blue-600">
							{attendees || 0}
						</p>
					</div>

					{/* Total Speakers */}
					<div className="p-6 bg-white rounded-lg shadow-md">
						<h2 className="text-xl font-semibold text-gray-700">
							Total Speakers
						</h2>
						<p className="mt-4 text-4xl font-bold text-green-600">
							{speakers || 0}
						</p>
					</div>

					{/* Attendee Stats */}
					<div className="p-6 bg-white rounded-lg shadow-md">
						<h2 className="text-xl font-semibold text-gray-700">
							Attendee Stats
						</h2>
						<p className="mt-4 text-4xl font-bold text-purple-600">
							{attendeeStats.registrationRate || 0}% Registered
						</p>
					</div>
				</div>

				{/* Conference Trends */}
				<div className="p-6 mb-6 bg-white rounded-lg shadow-md">
					<h2 className="mb-4 text-2xl font-semibold text-gray-700">
						Conference Trends
					</h2>
					<canvas
						id="conferenceTrendsChart"
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
