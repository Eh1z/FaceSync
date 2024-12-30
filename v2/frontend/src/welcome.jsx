import React from "react";

const Welcome = () => {
	return (
		<div className="w-full h-screen flex flex-col items-center justify-center gap-8 bg-slate-50">
			<span className="text-5xl ">Welcome Admin</span>
			<a href="dashboard">
				<button className="py-3 px-8 bg-slate-700 text-white rounded">
					Login
				</button>
			</a>
		</div>
	);
};

export default Welcome;
