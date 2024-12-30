// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#1E40AF", // Example custom color
			},
			fontFamily: {
				sans: ["Inter", "sans-serif"], // Example custom font
			},
		},
	},
	plugins: [],
};
