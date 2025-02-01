// src/App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./layout";
import Welcome from "./welcome";
import NewAccount from "./components/newAccount";
import Login from "./components/login";

const App = () => {
	return (
		<BrowserRouter className="w-full">
			<Routes>
				<Route path="/" element={<Welcome />} />
				<Route path="/register" element={<NewAccount />} />
				<Route path="/login" element={<Login />} />
				<Route path="/dashboard/*" element={<Layout />} />
			</Routes>
		</BrowserRouter>
	);
};
export default App;
