import React, { useState } from "react";
import { PiStudentFill } from "react-icons/pi";
import { BiSupport } from "react-icons/bi";
import { MdOutlineSettings } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { TbLayoutDashboard } from "react-icons/tb";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
	const location = useLocation();
	const links = [
		{ path: "/dashboard", name: "dashboard", icon: <TbLayoutDashboard /> },
		{
			path: "/dashboard/attendance",
			name: "attendance",
			icon: <IoIosPeople />,
		},
		{
			path: "/dashboard/registration",
			name: "student registration",
			icon: <PiStudentFill />,
		},
		{
			path: "/dashboard/lecturers",
			name: "lecturer registration",
			icon: <PiStudentFill />,
		},
		{
			path: "/dashboard/courses",
			name: "course registration",
			icon: <PiStudentFill />,
		},

		{
			path: "/dashboard/students",
			name: "students report",
			icon: <PiStudentFill />,
		},

		{ path: "/dashboard/support", name: "support", icon: <BiSupport /> },
		{
			path: "/dashboard/settings",
			name: "settings",
			icon: <MdOutlineSettings />,
		},
	];

	return (
		<div className="flex flex-col gap-5 items-start justify-start w-[300px] h-screen p-5">
			<div className="w-full flex items-center justify-center p-3 bg-[--secondary] rounded-xl font-bold text-xl">
				<span className="text-[--accent]">Face</span>Sync
				<span className="text-[--accent]">_</span>
			</div>
			<div className="w-full flex flex-col gap-6 items-center">
				{links.map((item) => (
					<a
						href={item.path}
						key={item.name}
						className={`flex items-center justify-start gap-3 p-3 hover:bg-gray-200  w-full rounded-xl cursor-pointer capitalize text-sm ${
							location.pathname === item.path &&
							"bg-[--secondary] text-[--accent]"
						}`}
					>
						<span>{item.icon}</span>
						<span>{item.name}</span>
					</a>
				))}
			</div>
		</div>
	);
};

export default Sidebar;
