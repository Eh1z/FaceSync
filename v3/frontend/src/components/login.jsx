import React from "react";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
	return (
		<div className="w-full h-screen flex justify-center items-center bg-[--secondary]">
			<SignIn signUpUrl="/register" />
		</div>
	);
};

export default Login;
