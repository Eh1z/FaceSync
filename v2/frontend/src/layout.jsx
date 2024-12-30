import React from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { Routes, Route } from "react-router-dom";
import Students from "./components/Students";
import Home from "./components/home";
import Attendance from "./components/attendance";
import Settings from "./components/settings";
import Support from "./components/support";

const Layout = () => {
	return (
		<div>
			<div className="flex">
				<Sidebar />
				{/* Content Section */}
				<div className="w-full px-5 py-2 bg-[--bgSoft] flex flex-col gap-3">
					<Navbar />
					<Routes>
						<Route index element={<Home />} />
						<Route path="students" element={<Students />} />
						<Route path="attendance" element={<Attendance />} />
						<Route path="settings" element={<Settings />} />
						<Route path="support" element={<Support />} />
					</Routes>
				</div>
			</div>
		</div>
	);
};

export default Layout;
