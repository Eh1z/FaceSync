import React, { useState, useEffect } from "react";
import Register from "./Register";
import { getUsers, addUser } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { normalizeLandmarks } from "../utils/faceRecognition";

const Students = () => {
	// State variables
	const [knownFaces, setKnownFaces] = useState([]);

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

	// Fetch user records on component mount
	useEffect(() => {
		fetchUsers();
	}, []);

	// Function to handle adding a new user
	const handleAddUser = async (user) => {
		try {
			// Normalize user landmarks before sending to backend
			const normalizedLandmarks = normalizeLandmarks(user.faceData);
			const updatedUser = { ...user, faceData: normalizedLandmarks };

			await addUser(updatedUser);
			toast.success("User registered successfully!");
			fetchUsers(); // Refresh knownFaces after adding a user
		} catch (error) {
			console.error("Error adding user:", error);
			toast.error("Failed to register user.");
		}
	};
	return (
		<div className="w-full h-[800px] p-5 rounded-xl grid grid-cols-2 gap-5">
			<div className="w-full">
				<h2 className="text-2xl font-semibold mb-4 text-gray-700">
					Register Student
				</h2>
				<Register onAddUser={handleAddUser} />
			</div>

			{/* Student List */}
			<section className="w-full ">
				<h2 className="text-2xl font-semibold mb-4 text-gray-700">
					Student List
				</h2>
				<div className="bg-white shadow rounded p-4">
					{knownFaces.length === 0 ? (
						<p className="text-center text-gray-500">
							No student records yet.
						</p>
					) : (
						<ul>
							{knownFaces.map((record, index) => (
								<li
									key={index}
									className="flex justify-between items-center py-2 border-b-2 last:border-0"
								>
									<span className="font-medium text-gray-800">
										{record.name}
									</span>
									<span className="text-sm text-gray-500">
										{record.email}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>

			{/* Toast Notifications */}
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Students;
