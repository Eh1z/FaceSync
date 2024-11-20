import React, { useRef, useEffect } from "react";

const WebcamFeed = ({ children }) => {
	const videoRef = useRef(null);

	useEffect(() => {
		const getWebcamFeed = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				});
				videoRef.current.srcObject = stream;
			} catch (error) {
				console.error("Error accessing webcam:", error);
			}
		};

		getWebcamFeed();
	}, []);

	return (
		<div>
			<video
				ref={videoRef}
				autoPlay
				muted
				style={{ width: "640px", height: "480px" }}
			></video>
			{React.cloneElement(children, { videoRef })}
		</div>
	);
};

export default WebcamFeed;
