import React from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { Routes, Route } from "react-router-dom";
import Attendees from "./components/attendees";
import Attendance from "./components/attendance";
import Speakers from "./components/speakers";
import Dashboard from "./components/dashboard";
import Registration from "./components/registration";

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
						<Route path="attendees" element={<Attendees />} />
						<Route path="registration" element={<Registration />} />
						<Route path="speakers" element={<Speakers />} />
						<Route path="sessions" element={<Sessions />} />
						<Route path="checkIn" element={<Attendance />} />
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
