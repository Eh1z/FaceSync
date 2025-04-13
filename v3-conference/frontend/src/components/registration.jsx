import React, { useState } from "react";
import { addUser } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./Register";

const Registration = () => {
	const handleAddUser = async (user) => {
		try {
			// Register the user with basic details and face data
			await addUser(user);
			toast.success("User registered successfully!");
			// Optionally refresh users or reset state here
		} catch (error) {
			console.error("Error adding user:", error);
			toast.error("Failed to register user.");
		}
	};

	return (
		<div className="w-full max-w-[800px] mx-auto p-6 bg-white shadow rounded">
			<h2 className="mb-4 text-2xl font-semibold text-gray-700">
				Register Attendee
			</h2>
			<Register onAddUser={handleAddUser} />
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Registration;
