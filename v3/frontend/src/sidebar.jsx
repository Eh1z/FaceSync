import React, { useState } from "react";
import { PiStudentFill } from "react-icons/pi";
import { BiSupport, BiLogOut } from "react-icons/bi";
import { MdOutlineSettings } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { TbLayoutDashboard } from "react-icons/tb";

const Sidebar = () => {
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
			path: "/dashboard/courses",
			name: "course registration",
			icon: <PiStudentFill />,
		},
		{
			path: "/dashboard/students",
			name: "students report",
			icon: <PiStudentFill />,
		},
		{
			path: "/dashboard/lecturers",
			name: "lecturers",
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
		<div className="flex flex-col gap-5 items-start justify-start w-[250px] h-screen p-5">
			<div className="w-full flex items-center justify-center p-3 bg-[--secondary] rounded-xl">
				LOGO
			</div>
			<div className="w-full flex flex-col gap-3 items-center">
				{links.map((item) => (
					<a
						href={item.path}
						key={item.name}
						className={`flex items-center justify-start gap-3 p-3 hover:bg-[--secondary] hover:text-[--accent] w-full rounded-xl cursor-pointer capitalize text-base`}
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
