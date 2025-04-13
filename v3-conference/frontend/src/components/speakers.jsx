import React, { useState, useEffect } from "react";
import { addSpeaker, getSpeakers, updateSpeaker, deleteSpeaker } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Speakers = () => {
	const [speakers, setSpeakers] = useState([]);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [job, setJob] = useState("");
	const [phone, setPhone] = useState("");
	const [bio, setBio] = useState("");
	const [editingSpeaker, setEditingSpeaker] = useState(null);
	const [editingName, setEditingName] = useState("");
	const [editingEmail, setEditingEmail] = useState("");
	const [editingJob, setEditingJob] = useState("");
	const [editingPhone, setEditingPhone] = useState("");
	const [editingBio, setEditingBio] = useState("");

	useEffect(() => {
		fetchSpeakers();
	}, []);

	const fetchSpeakers = async () => {
		try {
			const response = await getSpeakers();
			setSpeakers(response.data);
		} catch (error) {
			toast.error("Failed to fetch speakers.");
			console.error(error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!name.trim() || !email.trim()) {
			toast.error("Name and email are required.");
			return;
		}

		const newSpeaker = {
			name: name.trim(),
			email: email.trim(),
			job: job.trim(),
			phone: phone.trim(),
			bio: bio.trim(),
		};

		try {
			await addSpeaker(newSpeaker);
			toast.success("Speaker added successfully!");
			setName("");
			setEmail("");
			setJob("");
			setPhone("");
			setBio("");
			fetchSpeakers();
		} catch (error) {
			toast.error("Failed to add speaker.");
			console.error(error);
		}
	};

	const handleEditClick = (speaker) => {
		setEditingSpeaker(speaker);
		setEditingName(speaker.name);
		setEditingEmail(speaker.email);
		setEditingJob(speaker.job);
		setEditingPhone(speaker.phone);
		setEditingBio(speaker.bio);
	};

	const handleEditCancel = () => {
		setEditingSpeaker(null);
		setEditingName("");
		setEditingEmail("");
		setEditingJob("");
		setEditingPhone("");
		setEditingBio("");
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		if (!editingName.trim() || !editingEmail.trim()) {
			toast.error("Name and email are required.");
			return;
		}

		const updatedSpeaker = {
			name: editingName.trim(),
			email: editingEmail.trim(),
			job: editingJob.trim(),
			phone: editingPhone.trim(),
			bio: editingBio.trim(),
		};

		try {
			await updateSpeaker(editingSpeaker._id, updatedSpeaker);
			toast.success("Speaker updated successfully!");
			handleEditCancel();
			fetchSpeakers();
		} catch (error) {
			toast.error("Failed to update speaker.");
			console.error(error);
		}
	};

	const handleDeleteSpeaker = async (speakerId) => {
		try {
			await deleteSpeaker(speakerId);
			toast.success("Speaker deleted successfully!");
			fetchSpeakers();
		} catch (error) {
			toast.error("Failed to delete speaker.");
			console.error(error);
		}
	};

	return (
		<div className="w-full p-6 mx-auto">
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
			<h2 className="mb-4 text-2xl font-bold">Speakers</h2>

			{/* Add New Speaker Form */}
			<div className="max-w-[800px] bg-white p-4 rounded shadow mb-8">
				<h3 className="mb-4 text-xl font-semibold">Add New Speaker</h3>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="speakerName"
							className="block mb-1 text-gray-700"
						>
							Name
						</label>
						<input
							id="speakerName"
							type="text"
							placeholder="Enter speaker name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full p-2 border rounded"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="speakerEmail"
							className="block mb-1 text-gray-700"
						>
							Email
						</label>
						<input
							id="speakerEmail"
							type="email"
							placeholder="Enter speaker email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full p-2 border rounded"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="speakerJob"
							className="block mb-1 text-gray-700"
						>
							Job Title
						</label>
						<input
							id="speakerJob"
							type="text"
							placeholder="Enter job title"
							value={job}
							onChange={(e) => setJob(e.target.value)}
							className="w-full p-2 border rounded"
						/>
					</div>
					<div>
						<label
							htmlFor="speakerPhone"
							className="block mb-1 text-gray-700"
						>
							Phone
						</label>
						<input
							id="speakerPhone"
							type="text"
							placeholder="Enter phone number"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="w-full p-2 border rounded"
						/>
					</div>
					<div>
						<label
							htmlFor="speakerBio"
							className="block mb-1 text-gray-700"
						>
							Bio
						</label>
						<textarea
							id="speakerBio"
							placeholder="Enter speaker bio"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							className="w-full p-2 border rounded"
						/>
					</div>

					<button
						type="submit"
						className="px-4 py-2 text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-600"
					>
						Add Speaker
					</button>
				</form>
			</div>

			{/* List of existing speakers */}
			<div className="p-4 bg-white rounded shadow">
				<h3 className="mb-4 text-xl font-semibold">
					Existing Speakers
				</h3>
				{speakers.length === 0 ? (
					<p>No speakers found.</p>
				) : (
					<table className="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Name
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Email
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Job Title
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{speakers.map((speaker) => (
								<tr key={speaker._id}>
									<td className="px-6 py-4 whitespace-nowrap">
										{speaker.name}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{speaker.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{speaker.job}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<button
											onClick={() =>
												handleEditClick(speaker)
											}
											className="px-2 py-1 mr-2 text-white transition duration-200 bg-yellow-500 rounded hover:bg-yellow-600"
										>
											Edit
										</button>
										<button
											onClick={() =>
												handleDeleteSpeaker(speaker._id)
											}
											className="px-2 py-1 text-white transition duration-200 bg-red-500 rounded hover:bg-red-600"
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{/* Edit Speaker Modal */}
			{editingSpeaker && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded shadow max-w-[800px] w-full">
						<h3 className="mb-4 text-xl font-semibold">
							Edit Speaker
						</h3>
						<form onSubmit={handleEditSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="editingName"
									className="block mb-1 text-gray-700"
								>
									Name
								</label>
								<input
									id="editingName"
									type="text"
									placeholder="Enter speaker name"
									value={editingName}
									onChange={(e) =>
										setEditingName(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label
									htmlFor="editingEmail"
									className="block mb-1 text-gray-700"
								>
									Email
								</label>
								<input
									id="editingEmail"
									type="email"
									placeholder="Enter speaker email"
									value={editingEmail}
									onChange={(e) =>
										setEditingEmail(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label
									htmlFor="editingJob"
									className="block mb-1 text-gray-700"
								>
									Job Title
								</label>
								<input
									id="editingJob"
									type="text"
									placeholder="Enter job title"
									value={editingJob}
									onChange={(e) =>
										setEditingJob(e.target.value)
									}
									className="w-full p-2 border rounded"
								/>
							</div>
							<div>
								<label
									htmlFor="editingPhone"
									className="block mb-1 text-gray-700"
								>
									Phone
								</label>
								<input
									id="editingPhone"
									type="text"
									placeholder="Enter phone number"
									value={editingPhone}
									onChange={(e) =>
										setEditingPhone(e.target.value)
									}
									className="w-full p-2 border rounded"
								/>
							</div>
							<div>
								<label
									htmlFor="editingBio"
									className="block mb-1 text-gray-700"
								>
									Bio
								</label>
								<textarea
									id="editingBio"
									placeholder="Enter speaker bio"
									value={editingBio}
									onChange={(e) =>
										setEditingBio(e.target.value)
									}
									className="w-full p-2 border rounded"
								/>
							</div>

							<div className="flex space-x-4">
								<button
									type="button"
									onClick={handleEditCancel}
									className="px-4 py-2 text-white transition duration-200 bg-gray-500 rounded hover:bg-gray-600"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 text-white transition duration-200 bg-green-500 rounded hover:bg-green-600"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Speakers;
