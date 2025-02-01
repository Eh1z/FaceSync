import React from "react";
import { SignUp } from "@clerk/clerk-react";

const NewAccount = () => {
	return (
		<div className="w-full h-screen flex justify-center items-center bg-[--secondary]">
			<SignUp signInUrl="/login" />
		</div>
	);
};

export default NewAccount;
