import React from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { Routes, Route } from "react-router-dom";
import Students from "./components/Students";
import Home from "./components/home";

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
					</Routes>
				</div>
			</div>
		</div>
	);
};

export default Layout;
