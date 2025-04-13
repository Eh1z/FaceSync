import axios from "axios";

// Base URL for the API
// const API_URL = "https://face-sync-backend.vercel.app";
const API_URL = "http://localhost:5000";

// Fetch Functions
export const getAttendees = (sessionId = "") =>
	axios.get(`${API_URL}/attendees?sessionId=${sessionId}`);
export const getSessions = () => axios.get(`${API_URL}/sessions`);
export const getSpeakers = () => axios.get(`${API_URL}/speakers`);
export const getConferenceStats = () =>
	axios.get(`${API_URL}/conference-stats`);

// Add Functions
export const addAttendee = (attendee) =>
	axios.post(`${API_URL}/attendees`, attendee);
export const addSession = (session) =>
	axios.post(`${API_URL}/sessions`, session);
export const addSpeaker = (speaker) =>
	axios.post(`${API_URL}/speakers`, speaker);

// Update Functions
export const updateAttendee = (id, data) =>
	axios.put(`${API_URL}/attendees/${id}`, data);
export const updateSession = (id, updatedSession) =>
	axios.put(`${API_URL}/sessions/${id}`, updatedSession);
export const updateSpeaker = (id, updatedSpeaker) =>
	axios.put(`${API_URL}/speakers/${id}`, updatedSpeaker);

// Delete Functions
export const deleteAttendee = (id) =>
	axios.delete(`${API_URL}/attendees/${id}`);
export const deleteSession = (id) => axios.delete(`${API_URL}/sessions/${id}`);
export const deleteSpeaker = (id) => axios.delete(`${API_URL}/speakers/${id}`);

// Attendance Functions (for session check-in)
export const markAttendanceForSession = (attendeeId, sessionId) =>
	axios.post(`${API_URL}/attendance`, { attendeeId, sessionId });
