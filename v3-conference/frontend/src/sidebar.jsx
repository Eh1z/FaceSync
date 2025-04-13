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
			name: "Check In",
			icon: <IoIosPeople />,
		},
		{
			path: "/dashboard/registration",
			name: "Attendee registration",
			icon: <PiStudentFill />,
		},
		{
			path: "/dashboard/speakers",
			name: "speaker registration",
			icon: <PiStudentFill />,
		},
		{
			path: "/dashboard/attendees",
			name: "registered guests",
			icon: <PiStudentFill />,
		},
	];

	return (
		<div className="flex flex-col gap-5 items-start justify-start w-[300px] h-screen p-5">
			<div className="w-full flex items-center justify-center p-3 bg-[--secondary] rounded-xl font-bold text-xl">
				<span className="text-[--accent]">FS</span>Conf
				<span className="text-[--accent]">_</span>
			</div>
			<div className="flex flex-col items-center w-full gap-6">
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
