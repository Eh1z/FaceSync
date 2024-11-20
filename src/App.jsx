import React, { useState, useRef } from "react";
import WebcamFeed from "./components/webcamFeed";
import FaceDetectionComponent from "./components/faceDetection";

const App = () => {
	const videoRef = useRef(null);
	return (
		<div style={{ textAlign: "center", margin: "20px" }}>
			<h1>Real-Time Face Detection</h1>
			<WebcamFeed>
				<FaceDetectionComponent videoRef={videoRef} />
			</WebcamFeed>
		</div>
	);
};

export default App;
