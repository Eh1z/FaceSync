import React, { useEffect } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
	const { openSignIn } = useClerk();
	const { isSignedIn, user } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		if (isSignedIn) {
			navigate("/dashboard", { replace: true });
		}
	}, [isSignedIn, navigate]);

	return (
		<div className="w-full h-screen flex flex-col items-center justify-center gap-8 bg-slate-50">
			<span className="text-5xl ">Welcome Admin</span>

			{!isSignedIn && (
				<button
					onClick={() => openSignIn({})}
					className="py-3 px-8 bg-slate-700 text-white rounded"
				>
					Sign In
				</button>
			)}
		</div>
	);
};

export default Welcome;
