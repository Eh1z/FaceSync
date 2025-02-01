import React from "react";

const Settings = () => {
	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
				<h1 className="text-3xl font-bold text-gray-800 mb-4">
					Settings
				</h1>
				<p className="text-gray-600 mb-6">
					Manage your account settings, profile information, and
					preferences below.
				</p>

				{/* User Profile Section */}
				<div className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-700 mb-4">
						User Profile
					</h2>
					<form className="space-y-4">
						<div>
							<label
								className="block text-gray-600 font-medium mb-1"
								htmlFor="username"
							>
								Username
							</label>
							<input
								type="text"
								id="username"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter your username"
							/>
						</div>
						<div>
							<label
								className="block text-gray-600 font-medium mb-1"
								htmlFor="email"
							>
								Email
							</label>
							<input
								type="email"
								id="email"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter your email"
							/>
						</div>
						<div>
							<label
								className="block text-gray-600 font-medium mb-1"
								htmlFor="password"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter a new password"
							/>
						</div>
						<button
							type="submit"
							className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
						>
							Save Changes
						</button>
					</form>
				</div>

				{/* Preferences Section */}
				<div className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-700 mb-4">
						Preferences
					</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-gray-600">
								Enable Notifications
							</span>
							<label className="flex items-center cursor-pointer">
								<input type="checkbox" className="sr-only" />
								<div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner toggle-bg"></div>
							</label>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Dark Mode</span>
							<label className="flex items-center cursor-pointer">
								<input type="checkbox" className="sr-only" />
								<div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner toggle-bg"></div>
							</label>
						</div>
					</div>
				</div>

				{/* Account Management Section */}
				<div>
					<h2 className="text-2xl font-semibold text-gray-700 mb-4">
						Account Management
					</h2>
					<div className="space-y-4">
						<button className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300">
							Deactivate Account
						</button>
						<button className="w-full px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-300">
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Settings;
