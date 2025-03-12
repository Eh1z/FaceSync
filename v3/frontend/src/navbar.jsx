import React from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { UserButton } from "@clerk/clerk-react";
const Navbar = () => {
	return (
		<div className="w-full bg-white p-5 rounded-xl flex items-center justify-between">
			<span className="text-xl font-medium">Welcome back!</span>

			<div className="flex gap-2 items-center">
				<div>
					<input
						type="text"
						className="w-full p-2 rounded-lg border bg-slate-50 text-sm outline-none"
						placeholder="Search..."
					/>
				</div>
				<div className="flex gap-2 items-center text-2xl text-[--accent]">
					<UserButton />
				</div>
			</div>
		</div>
	);
};

export default Navbar;
