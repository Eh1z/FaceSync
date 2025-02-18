import { addUser } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./Register";

const Registration = () => {
	// Function to handle adding a new user
	const handleAddUser = async (user) => {
		try {
			// Directly pass the user object (no need to normalize faceData)
			const updatedUser = { ...user };

			await addUser(updatedUser); // Send the user data (with image and face data)
			toast.success("User registered successfully!");
			fetchUsers(); // Refresh the knownFaces list after adding the user
		} catch (error) {
			console.error("Error adding user:", error);
			toast.error("Failed to register user.");
		}
	};
	return (
		<div className="w-full">
			<h2 className="text-2xl font-semibold mb-4 text-gray-700">
				Register Student
			</h2>
			<Register onAddUser={handleAddUser} />
			{/* Toast Notifications */}
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Registration;
