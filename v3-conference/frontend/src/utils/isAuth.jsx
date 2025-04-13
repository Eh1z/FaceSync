import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const isAuth = (Component) => {
	return (props) => {
		const { isLoaded, isSignedIn } = useUser();

		// Wait until Clerk finishes loading
		if (!isLoaded) {
			return <div>Loading...</div>;
		}

		// Redirect unauthenticated users to the home page
		if (!isSignedIn) {
			return <Navigate to="/" replace />;
		}

		// Render the protected component for authenticated users
		return <Component {...props} />;
	};
};

export default isAuth;
