// src/components/Registration.js
import React, { useState, useEffect } from "react";
import { addUser, getCourses } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./Register";

const Registration = () => {
	const [courses, setCourses] = useState([]);

	useEffect(() => {
		// Fetch available courses from backend
		const fetchCourses = async () => {
			try {
				const response = await getCourses();
				setCourses(response.data);
			} catch (error) {
				console.error("Error fetching courses:", error);
			}
		};
		fetchCourses();
	}, []);

	const handleAddUser = async (user) => {
		try {
			// user now includes courses (array of course IDs)
			await addUser(user);
			toast.success("User registered successfully!");
			// Optionally refresh users or reset state here
		} catch (error) {
			console.error("Error adding user:", error);
			toast.error("Failed to register user.");
		}
	};

	return (
		<div className="w-full max-w-[800px]">
			<h2 className="text-2xl font-semibold mb-4 text-gray-700">
				Register Student
			</h2>
			<Register courses={courses} onAddUser={handleAddUser} />
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Registration;
