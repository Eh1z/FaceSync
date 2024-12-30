import React from "react";
import { LuBox } from "react-icons/lu";

const Sidebar = () => {
	const links = [
		{ path: "/dashboard", name: "dashboard", icon: <LuBox /> },
		{ path: "/dashboard/attendance", name: "attendance", icon: <LuBox /> },
		{ path: "/dashboard/students", name: "students", icon: <LuBox /> },
		{ path: "/dashboard/support", name: "support", icon: <LuBox /> },
		{ path: "/dashboard/settings", name: "settings", icon: <LuBox /> },
		{ path: "/", name: "logout", icon: <LuBox /> },
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
						className="flex items-center justify-start gap-3 p-3 hover:bg-[--secondary] hover:text-[--accent] w-full rounded-xl cursor-pointer capitalize text-base"
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
