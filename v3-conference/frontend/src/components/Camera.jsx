// src/components/Camera.jsx
import React, {
	useRef,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from "react";

const CameraComponent = forwardRef((props, ref) => {
	const videoRef = useRef(null);

	// Start the camera when the component mounts
	useEffect(() => {
		const startCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				});
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			} catch (err) {
				console.error("Error accessing camera:", err);
			}
		};

		startCamera();
	}, []);

	// Define a capture method that grabs the current video frame using a canvas
	const capture = () => {
		if (!videoRef.current) return null;
		const video = videoRef.current;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		// Return the image as a base64-encoded JPEG
		return canvas.toDataURL("image/jpeg");
	};

	// Optionally, expose methods to start and stop the camera
	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
		} catch (err) {
			console.error("Error starting camera:", err);
		}
	};

	const stopCamera = () => {
		if (videoRef.current && videoRef.current.srcObject) {
			const stream = videoRef.current.srcObject;
			stream.getTracks().forEach((track) => track.stop());
		}
	};

	// Expose the capture, startCamera, and stopCamera methods to the parent component
	useImperativeHandle(ref, () => ({
		capture,
		startCamera,
		stopCamera,
	}));

	return (
		<video
			ref={videoRef}
			autoPlay
			playsInline
			style={{ width: "100%", height: "auto" }}
			className="object-cover border-2 border-green-500 border-dashed"
		/>
	);
});

export default CameraComponent;
