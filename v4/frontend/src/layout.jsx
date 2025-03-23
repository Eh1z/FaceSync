import React from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { Routes, Route } from "react-router-dom";
import Students from "./components/Students";
import Attendance from "./components/attendance";
import Settings from "./components/settings";
import Support from "./components/support";
import Dashboard from "./components/dashboard";
import Courses from "./components/courses";
import Registration from "./components/registration";
import Lecturers from "./components/lecturers";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import isAuth from "./utils/isAuth";

const Layout = () => {
	return (
		<div>
			<div className="flex">
				<Sidebar />
				{/* Content Section */}
				<div className="w-full px-5 py-2 bg-[--bgSoft] flex flex-col gap-3 max-h-screen overflow-y-scroll">
					<Navbar />
					<Routes>
						<Route index element={<Dashboard />} />
						<Route path="students" element={<Students />} />
						<Route path="courses" element={<Courses />} />
						<Route path="registration" element={<Registration />} />
						<Route path="lecturers" element={<Lecturers />} />
						<Route path="attendance" element={<Attendance />} />
						<Route path="settings" element={<Settings />} />
						<Route path="support" element={<Support />} />
					</Routes>
				</div>
			</div>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
		</div>
	);
};

export default isAuth(Layout);
