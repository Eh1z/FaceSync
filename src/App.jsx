import React, { useState } from "react";
import WebcamFeed from "./components/webcamFeed";
import FaceDetectionComponent from "./components/faceDetection";

const App = () => {
	const [validFace, setValidFace] = useState(false);
	const [feedback, setFeedback] = useState([]);

	const handleValidFace = () => {
		setValidFace(true);
		setFeedback(["Face is in the correct position!"]);
	};

	const handleInvalidFace = () => {
		setValidFace(false);
		setFeedback(["Please adjust your face position."]);
	};

	return (
		<div style={{ textAlign: "center", margin: "20px" }}>
			<h1>Real-Time Face Detection</h1>
			<WebcamFeed>
				<FaceDetectionComponent
					onValidFace={handleValidFace}
					onInvalidFace={handleInvalidFace}
				/>
			</WebcamFeed>
			<div>
				{feedback.map((msg, index) => (
					<p
						key={index}
						style={{ color: validFace ? "green" : "red" }}
					>
						{msg}
					</p>
				))}
			</div>
		</div>
	);
};

export default App;
