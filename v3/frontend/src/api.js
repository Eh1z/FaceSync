// src/api.js
import axios from "axios";

const API_URL = "https://face-sync-backend.vercel.app";

// Fetch Functions
export const getUsers = () => axios.get(`${API_URL}/users`);
export const getAttendance = () => axios.get(`${API_URL}/attendance`);
export const getLecturers = () => axios.get(`${API_URL}/lecturers`);
export const getCourses = () => axios.get(`${API_URL}/courses`);

// Add functions
export const addUser = (user) => axios.post(`${API_URL}/users`, user);
export const addLecturer = (lecturer) =>
	axios.post(`${API_URL}/lecturers`, lecturer);
export const addCourse = (course) => axios.post(`${API_URL}/courses`, course);

// Update Functions
export const markAttendance = (userId) =>
	axios.post(`${API_URL}/attendance`, { userId });
export const updateLecturer = (id, data) =>
	axios.post(`${API_URL}/lecturers/${id}`, data);
