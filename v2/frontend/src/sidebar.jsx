import React from "react";
import { LuBox } from "react-icons/lu";

const Sidebar = () => {
	const links = [
		{ path: "/", name: "dashboard", icon: <LuBox /> },
		{ path: "/", name: "attendance", icon: <LuBox /> },
		{ path: "/", name: "students", icon: <LuBox /> },
		{ path: "/", name: "support", icon: <LuBox /> },
		{ path: "/", name: "settings", icon: <LuBox /> },
		{ path: "/", name: "logout", icon: <LuBox /> },
	];
	return (
		<div className="flex flex-col gap-5 items-start justify-start w-[250px] h-screen p-5">
			<div className="w-full flex items-center justify-center p-3 bg-[--secondary] rounded-xl">
				LOGO
			</div>
			<div className="w-full flex flex-col gap-3 items-center">
				{links.map((item) => (
					<div className="flex items-center justify-start gap-3 p-3 hover:bg-[--secondary] hover:text-[--accent] w-full rounded-xl cursor-pointer capitalize text-base">
						<span>{item.icon}</span>
						<span>{item.name}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default Sidebar;
