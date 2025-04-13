// src/App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./layout";
import Welcome from "./welcome";

const App = () => {
	return (
		<BrowserRouter className="w-full">
			<Routes>
				<Route path="/" element={<Welcome />} />
				<Route path="/dashboard/*" element={<Layout />} />
			</Routes>
		</BrowserRouter>
	);
};
export default App;
