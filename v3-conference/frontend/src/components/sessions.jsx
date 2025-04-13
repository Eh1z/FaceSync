import React, { useState, useEffect } from "react";
import {
	addSession,
	getSpeakers,
	getSessions,
	updateSession,
	deleteSession,
} from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Sessions = () => {
	const [sessionName, setSessionName] = useState("");
	const [sessionCode, setSessionCode] = useState("");
	const [sessionSpeaker, setSessionSpeaker] = useState("");
	const [speakers, setSpeakers] = useState([]);
	const [sessions, setSessions] = useState([]);

	const [editingSession, setEditingSession] = useState(null);
	const [editingSessionName, setEditingSessionName] = useState("");
	const [editingSessionCode, setEditingSessionCode] = useState("");
	const [editingSessionSpeaker, setEditingSessionSpeaker] = useState("");

	useEffect(() => {
		fetchSpeakers();
		fetchSessions();
	}, []);

	const fetchSpeakers = async () => {
		try {
			const response = await getSpeakers();
			setSpeakers(response.data);
		} catch (error) {
			toast.error("Failed to fetch speakers");
			console.error("Error fetching speakers:", error);
		}
	};

	const fetchSessions = async () => {
		try {
			const response = await getSessions();
			setSessions(response.data);
		} catch (error) {
			toast.error("Failed to fetch sessions");
			console.error("Error fetching sessions:", error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!sessionName.trim() || !sessionCode.trim()) {
			toast.error("Session Name and Session Code are required.");
			return;
		}

		const newSession = {
			sessionName: sessionName.trim(),
			sessionCode: sessionCode.trim(),
			speaker: sessionSpeaker || null, // Optional: pass speaker ID if selected
		};

		try {
			await addSession(newSession);
			toast.success("Session created successfully!");
			setSessionName("");
			setSessionCode("");
			setSessionSpeaker("");
			fetchSessions(); // Reload the list of sessions after adding
		} catch (error) {
			toast.error("Failed to create session.");
			console.error("Session creation error:", error);
		}
	};

	// Edit Session Functions
	const handleEditClick = (session) => {
		setEditingSession(session);
		setEditingSessionName(session.sessionName);
		setEditingSessionCode(session.sessionCode);
		setEditingSessionSpeaker(session.speaker ? session.speaker._id : "");
	};

	const handleEditCancel = () => {
		setEditingSession(null);
		setEditingSessionName("");
		setEditingSessionCode("");
		setEditingSessionSpeaker("");
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		if (!editingSessionName.trim() || !editingSessionCode.trim()) {
			toast.error("Session Name and Session Code are required.");
			return;
		}

		const updatedSession = {
			sessionName: editingSessionName.trim(),
			sessionCode: editingSessionCode.trim(),
			speaker: editingSessionSpeaker || null,
		};

		try {
			await updateSession(editingSession._id, updatedSession);
			toast.success("Session updated successfully!");
			handleEditCancel();
			fetchSessions();
		} catch (error) {
			toast.error("Failed to update session.");
			console.error("Session update error:", error);
		}
	};

	const handleDeleteSession = async (sessionId) => {
		try {
			await deleteSession(sessionId);
			toast.success("Session deleted successfully!");
			fetchSessions();
		} catch (error) {
			toast.error("Failed to delete session.");
			console.error("Session deletion error:", error);
		}
	};

	return (
		<div className="grid w-full grid-cols-1 gap-16">
			{/* Form to create a new session */}
			<div className="w-full max-w-[800px] mx-auto p-6 bg-white shadow rounded">
				<h2 className="mb-4 text-2xl font-bold">Create Session</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="sessionName"
							className="block text-gray-700"
						>
							Session Name
						</label>
						<input
							type="text"
							id="sessionName"
							value={sessionName}
							onChange={(e) => setSessionName(e.target.value)}
							className="w-full p-2 border rounded"
							placeholder="Enter session name"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="sessionCode"
							className="block text-gray-700"
						>
							Session Code
						</label>
						<input
							type="text"
							id="sessionCode"
							value={sessionCode}
							onChange={(e) => setSessionCode(e.target.value)}
							className="w-full p-2 border rounded"
							placeholder="Enter session code"
							required
						/>
					</div>

					<div>
						<label
							htmlFor="speaker"
							className="block text-gray-700"
						>
							Speaker (Optional)
						</label>
						<select
							id="speaker"
							value={sessionSpeaker}
							onChange={(e) => setSessionSpeaker(e.target.value)}
							className="w-full p-2 border rounded"
						>
							<option value="">Select Speaker</option>
							{speakers.map((spe) => (
								<option key={spe._id} value={spe._id}>
									{spe.name} ({spe.email})
								</option>
							))}
						</select>
					</div>
					<button
						type="submit"
						className="w-full px-4 py-2 text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-600"
					>
						Create Session
					</button>
				</form>
			</div>

			{/* Existing Sessions List */}
			<div className="w-full p-6 mx-auto bg-white rounded shadow">
				<h3 className="mt-8 mb-4 text-xl font-semibold">
					Existing Sessions
				</h3>
				{sessions.length === 0 ? (
					<p>No sessions found.</p>
				) : (
					<table className="min-w-full mt-4 divide-y divide-gray-200">
						<thead>
							<tr>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Session Name
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Session Code
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Speaker
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{sessions.map((session) => (
								<tr key={session._id}>
									<td className="px-6 py-4 whitespace-nowrap">
										{session.sessionName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{session.sessionCode}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{session.speaker
											? `${session.speaker.name} (${session.speaker.email})`
											: "No speaker assigned"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<button
											onClick={() =>
												handleEditClick(session)
											}
											className="px-2 py-1 mr-2 text-white transition duration-200 bg-yellow-500 rounded hover:bg-yellow-600"
										>
											Edit
										</button>
										<button
											onClick={() =>
												handleDeleteSession(session._id)
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

			{/* Edit Session Modal */}
			{editingSession && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded shadow max-w-[800px] w-full">
						<h3 className="mb-4 text-xl font-semibold">
							Edit Session
						</h3>
						<form onSubmit={handleEditSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="editingSessionName"
									className="block mb-1 text-gray-700"
								>
									Session Name
								</label>
								<input
									id="editingSessionName"
									type="text"
									placeholder="Enter session name"
									value={editingSessionName}
									onChange={(e) =>
										setEditingSessionName(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>
							<div>
								<label
									htmlFor="editingSessionCode"
									className="block mb-1 text-gray-700"
								>
									Session Code
								</label>
								<input
									id="editingSessionCode"
									type="text"
									placeholder="Enter session code"
									value={editingSessionCode}
									onChange={(e) =>
										setEditingSessionCode(e.target.value)
									}
									className="w-full p-2 border rounded"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="editingSpeaker"
									className="block mb-1 text-gray-700"
								>
									Speaker
								</label>
								<select
									id="editingSpeaker"
									value={editingSessionSpeaker}
									onChange={(e) =>
										setEditingSessionSpeaker(e.target.value)
									}
									className="w-full p-2 border rounded"
								>
									<option value="">Select Speaker</option>
									{speakers.map((spe) => (
										<option key={spe._id} value={spe._id}>
											{spe.name} ({spe.email})
										</option>
									))}
								</select>
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

			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
			/>
		</div>
	);
};

export default Sessions;
