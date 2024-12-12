// src/components/Camera.jsx
import React, { useRef, useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const CameraComponent = ({ onFaceDetected }) => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		const videoElement = videoRef.current;
		const canvasElement = canvasRef.current;
		const canvasCtx = canvasElement.getContext("2d");

		const faceMesh = new FaceMesh({
			locateFile: (file) =>
				`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
		});

		faceMesh.setOptions({
			maxNumFaces: 1,
			refineLandmarks: true,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});

		faceMesh.onResults((results) => {
			canvasCtx.save();
			canvasCtx.clearRect(
				0,
				0,
				canvasElement.width,
				canvasElement.height
			);
			canvasCtx.drawImage(
				results.image,
				0,
				0,
				canvasElement.width,
				canvasElement.height
			);
			if (results.multiFaceLandmarks) {
				// Optionally, draw landmarks
				// For now, we'll pass the landmarks to the parent component
				onFaceDetected(results.multiFaceLandmarks[0]);
			}
			canvasCtx.restore();
		});

		const camera = new Camera(videoElement, {
			onFrame: async () => {
				await faceMesh.send({ image: videoElement });
			},
			width: 640,
			height: 480,
		});
		camera.start();

		return () => {
			camera.stop();
		};
	}, [onFaceDetected]);

	return (
		<div className="w-full max-w-md bg-white shadow-md rounded-lg p-4 mb-6">
			<h2 className="text-xl font-semibold mb-4 text-gray-700">
				Camera Feed
			</h2>
			<div className="relative">
				<video ref={videoRef} className="hidden"></video>
				<canvas
					ref={canvasRef}
					className="w-full h-auto rounded-md"
				></canvas>
			</div>
		</div>
	);
};

export default CameraComponent;
