import axios from "axios";

// Base URL for the API
// const API_URL = "https://face-sync-backend.vercel.app";
const API_URL = "http://localhost:5000";

// Fetch Functions
export const getUsers = () => axios.get(`${API_URL}/users`);
export const getAttendance = (name = "") =>
	axios.get(`${API_URL}/attendance`, { name });
export const getLecturers = () => axios.get(`${API_URL}/lecturers`);
export const getCourses = (level = "", semester = "") =>
	axios.get(`${API_URL}/courses?level=${level}&semester=${semester}`);

// New Fetch Functions for Dashboard Data
export const getStudents = () => axios.get(`${API_URL}/students`);
export const getAttendanceRatio = () =>
	axios.get(`${API_URL}/attendance-ratio`);
export const getRecentActivity = () => axios.get(`${API_URL}/recent-activity`);
export const getAttendanceTrends = () =>
	axios.get(`${API_URL}/attendance-trends`);
export const getUpcomingCourses = () =>
	axios.get(`${API_URL}/upcoming-courses`);

// Add Functions
export const addUser = (user) => axios.post(`${API_URL}/users`, user);
export const addLecturer = (lecturer) =>
	axios.post(`${API_URL}/lecturers`, lecturer);
export const addCourse = (course) => axios.post(`${API_URL}/courses`, course);
export const createAttendanceList = (courseCode) =>
	axios.post(`${API_URL}/attendance`, { courseCode });

// Update Functions
export const markAttendance = (userId) =>
	axios.post(`${API_URL}/attendance`, { userId });
export const updateLecturer = (id, data) =>
	axios.put(`${API_URL}/lecturers/${id}`, data);
export const updateCourse = (id, updatedCourse) =>
	axios.put(`${API_URL}/courses/${id}`, updatedCourse);
// New Update Function for Users
export const updateUser = (id, data) =>
	axios.put(`${API_URL}/users/${id}`, data);

// New Update Functions for Dashboard Data
export const updateStudentAttendance = (studentId, courseCode) =>
	axios.put(`${API_URL}/attendance`, { studentId, courseCode });

// Delete Functions
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);
export const deleteLecturer = (id) =>
	axios.delete(`${API_URL}/lecturers/${id}`);
export const deleteCourse = (id) => axios.delete(`${API_URL}/courses/${id}`);
