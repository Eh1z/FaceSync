import React, { useState, useRef } from "react";
import WebcamFeed from "./components/webcamFeed";
import FaceDetectionComponent from "./components/faceDetection";

const App = () => {
	const videoRef = useRef(null);
	return (
		<div className="w-full flex flex-col items-center py-8 gap-16">
			<h1 className="text-5xl">Real-Time Face Detection</h1>
			<WebcamFeed>
				<FaceDetectionComponent videoRef={videoRef} />
			</WebcamFeed>
		</div>
	);
};

export default App;
