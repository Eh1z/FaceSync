// src/components/Register.jsx
import React, { useState } from "react";
import CameraComponent from "./Camera";
import { addUser } from "../api";

const Register = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");

	const handleFaceCaptured = async (landmarks) => {
		if (!name || !email) {
			alert(
				"Please enter both name and email before capturing the face."
			);
			return;
		}

		// Convert landmarks to a storable format, e.g., JSON or embeddings
		const faceData = landmarks; // Simplification

		const user = { name, email, faceData };
		try {
			await addUser(user);
			alert("User registered successfully!");
			setName("");
			setEmail("");
		} catch (error) {
			console.error(error);
			alert("Failed to register user.");
		}
	};

	return (
		<div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
			<h2 className="text-xl font-semibold mb-4 text-gray-700">
				Register User
			</h2>
			<form className="space-y-4">
				<div>
					<label className="block text-gray-600 mb-1" htmlFor="name">
						Name
					</label>
					<input
						id="name"
						type="text"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
						placeholder="Enter your name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
				<div>
					<label className="block text-gray-600 mb-1" htmlFor="email">
						Email
					</label>
					<input
						id="email"
						type="email"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div>
					<p className="text-gray-600 mb-2">Capture your face:</p>
					<CameraComponent onFaceDetected={handleFaceCaptured} />
				</div>
			</form>
		</div>
	);
};

export default Register;
