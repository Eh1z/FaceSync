import React from "react";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";

const Welcome = () => {
	return (
		<div className="w-full h-screen flex flex-col items-center justify-center gap-8 bg-slate-50">
			<span className="text-5xl ">Welcome Admin</span>

			<a href="/dashboard">
				<button className="py-3 px-8 bg-slate-700 text-white rounded">
					View Dashboard
				</button>
			</a>
		</div>
	);
};

export default Welcome;
