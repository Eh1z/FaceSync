import React from "react";

const Support = () => {
	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
				<h1 className="text-3xl font-bold text-gray-800 mb-4">
					Support
				</h1>
				<p className="text-gray-600 mb-6">
					Welcome to the support page for the Facial Recognition Class
					Attendance System. If you encounter any issues or have
					questions, please refer to the resources below or reach out
					to us.
				</p>

				<div className="space-y-6">
					{/* FAQ Section */}
					<div>
						<h2 className="text-2xl font-semibold text-gray-700 mb-2">
							Frequently Asked Questions
						</h2>
						<ul className="list-disc list-inside text-gray-600">
							<li>How do I register a new student?</li>
							<li>
								What do I do if the system doesn't recognize a
								student?
							</li>
							<li>
								Can I access attendance data from previous
								months?
							</li>
						</ul>
					</div>

					{/* Contact Us Section */}
					<div>
						<h2 className="text-2xl font-semibold text-gray-700 mb-2">
							Contact Us
						</h2>
						<p className="text-gray-600">
							If you need further assistance, feel free to contact
							us through the following channels:
						</p>
						<ul className="list-none mt-2 text-gray-600 space-y-1">
							<li>
								<span className="font-medium">Email:</span>
								<a
									href="mailto:support@facialattendance.com"
									className="text-blue-600 hover:underline"
								>
									support@facialattendance.com
								</a>
							</li>
							<li>
								<span className="font-medium">Phone:</span>
								<a
									href="tel:+1234567890"
									className="text-blue-600 hover:underline"
								>
									+1 (234) 567-890
								</a>
							</li>
							<li>
								<span className="font-medium">Live Chat:</span>{" "}
								Available 9 AM - 5 PM (Mon-Fri)
							</li>
						</ul>
					</div>

					{/* Tutorials Section */}
					<div>
						<h2 className="text-2xl font-semibold text-gray-700 mb-2">
							Tutorials
						</h2>
						<p className="text-gray-600">
							Learn how to get started with our system through
							these step-by-step guides:
						</p>
						<ul className="list-disc list-inside text-gray-600 mt-2">
							<li>
								<a
									href="/tutorials/getting-started"
									className="text-blue-600 hover:underline"
								>
									Getting Started
								</a>
							</li>
							<li>
								<a
									href="/tutorials/adding-students"
									className="text-blue-600 hover:underline"
								>
									Adding Students
								</a>
							</li>
							<li>
								<a
									href="/tutorials/generating-reports"
									className="text-blue-600 hover:underline"
								>
									Generating Reports
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Support;
