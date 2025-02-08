// src/api.js
import axios from "axios";

const API_URL = "https://face-sync-backend.vercel.app";

export const getUsers = () => axios.get(`${API_URL}/users`);
export const addUser = (user) => axios.post(`${API_URL}/users`, user);
export const markAttendance = (userId) =>
	axios.post(`${API_URL}/attendance`, { userId });
export const getAttendance = () => axios.get(`${API_URL}/attendance`);
