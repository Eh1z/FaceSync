// src/components/Camera.jsx
import React, {
	useRef,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera as MediaCamera } from "@mediapipe/camera_utils";

const CameraComponent = forwardRef(({ onFaceDetected }, ref) => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const cameraInstance = useRef(null);
	const faceMesh = useRef(null);

	useImperativeHandle(ref, () => ({
		capture: () => {
			if (canvasRef.current) {
				return canvasRef.current.toDataURL("image/png");
			}
			return null;
		},
		startCamera: () => {
			if (cameraInstance.current) {
				cameraInstance.current.start();
				console.log("Camera started via parent.");
			}
		},
		stopCamera: () => {
			if (cameraInstance.current) {
				cameraInstance.current.stop();
				console.log("Camera stopped via parent.");
			}
		},
	}));

	useEffect(() => {
		console.log("Initializing CameraComponent");

		if (!videoRef.current || !canvasRef.current) {
			console.error("Video or Canvas reference is missing");
			return;
		}

		const videoElement = videoRef.current;
		const canvasElement = canvasRef.current;
		const canvasCtx = canvasElement.getContext("2d");

		// Initialize FaceMesh
		faceMesh.current = new FaceMesh({
			locateFile: (file) =>
				`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
		});

		faceMesh.current.setOptions({
			maxNumFaces: 1,
			refineLandmarks: true,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});

		faceMesh.current.onResults((results) => {
			console.log("FaceMesh results:", results);
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
				onFaceDetected(results.multiFaceLandmarks[0]);
			}

			canvasCtx.restore();
		});

		// Initialize MediaCamera
		cameraInstance.current = new MediaCamera(videoElement, {
			onFrame: async () => {
				try {
					await faceMesh.current.send({ image: videoElement });
				} catch (err) {
					console.error("Error sending frame to FaceMesh:", err);
				}
			},
			width: 640,
			height: 480,
		});

		// Start the camera
		cameraInstance.current
			.start()
			.then(() => {
				console.log("Camera started successfully");
			})
			.catch((error) => {
				console.error("Camera failed to start:", error);
				toast.error(
					"Failed to access the camera. Please check permissions."
				);
			});

		// Cleanup on unmount
		return () => {
			if (cameraInstance.current) {
				cameraInstance.current.stop();
				console.log("Camera stopped on unmount.");
			}
		};
	}, [onFaceDetected]);

	return (
		<div className="w-full max-w-md bg-white shadow-md rounded-lg p-4 mb-6">
			<div className="relative border-2 border-blue-500">
				<video
					ref={videoRef}
					className="w-full h-auto rounded-md"
					autoPlay
					muted
					playsInline
				></video>
				<canvas
					ref={canvasRef}
					className="absolute top-0 left-0 w-full h-full rounded-md border-2 border-red-500"
					width="640"
					height="480"
				></canvas>
			</div>
		</div>
	);
});

export default CameraComponent;
