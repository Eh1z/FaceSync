// src/components/Camera.jsx
import React, { useRef, useEffect } from "react";

const CameraComponent = React.forwardRef((props, ref) => {
	const videoRef = useRef(null);

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

	return (
		<video
			ref={(video) => {
				videoRef.current = video;
				if (ref) ref.current = video;
			}}
			autoPlay
			playsInline
			style={{ width: "100%", height: "auto" }}
			className=" object-cover  border-2 border-green-500 border-dashed"
		/>
	);
});

export default CameraComponent;
