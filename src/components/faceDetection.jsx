import React, { useEffect, useState, useRef } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import {
	isTooDarkOrTooBright,
	hasMultipleFaces,
	isFaceDistanceValid,
	isFaceCentered,
	isHeadOrientationValid,
} from "../utils/validations"; // Import your validations

const FaceDetectionComponent = ({ videoRef, onValidFace, onInvalidFace }) => {
	const [feedback, setFeedback] = useState(""); // Store feedback for UI display
	const [validFace, setValidFace] = useState(false); // Track valid/invalid face
	const [countdown, setCountdown] = useState(null); // Countdown state
	const timerRef = useRef(null); // Ref to store the timer ID

	// Starts the countdown
	const startCountdown = (duration) => {
		setCountdown(duration);
		if (timerRef.current) clearInterval(timerRef.current);

		timerRef.current = setInterval(() => {
			setCountdown((prev) => {
				if (prev > 1) {
					return prev - 1;
				} else {
					clearInterval(timerRef.current);
					captureFrame(); // Automatically capture the frame
					return null; // Stop the countdown
				}
			});
		}, 1000);
	};

	// Stops the countdown
	const stopCountdown = () => {
		setCountdown(null);
		setCountdown(null);
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}
	};

	// Capture Image Function
	const captureFrame = () => {
		setFeedback("Frame captured successfully!");
		// Add your frame capture logic here
		console.log("Frame captured!");
	};

	useEffect(() => {
		if (videoRef.current) {
			const faceDetector = new FaceDetection({
				locateFile: (file) =>
					`https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
			});

			faceDetector.setOptions({
				model: "short",
				minDetectionConfidence: 0.5,
			});

			// Wrap your async function
			const detectFacesAsync = async (results) => {
				const video = videoRef.current;

				// Perform validations on the frame and face
				const { isTooDark, isTooBright } = isTooDarkOrTooBright(video);
				//console.log("Face detection results:", results.detections);
				if (isTooDark) {
					setFeedback(
						"The image is too dark. Please adjust the lighting."
					);
					setValidFace(false);
				}

				if (isTooBright) {
					setFeedback(
						"The image is too bright. Please adjust the lighting."
					);
					setValidFace(false);
					return;
				}

				// Check for multiple faces
				if (hasMultipleFaces(results.detections)) {
					setFeedback(
						"Multiple faces detected. Only one face is allowed."
					);
					setValidFace(false);
					return;
				}

				if (results.detections.length === 1) {
					const face = results.detections[0];
					const landmarks = results.detections[0].landmarks;

					// Validate face distance (too far or too close)
					const distanceValidation = isFaceDistanceValid(face);
					if (distanceValidation === "too far") {
						setFeedback(
							"Multiple faces detected. Only one face is allowed."
						);
						setValidFace(false);
						return;
					}

					if (distanceValidation === "too close") {
						setFeedback("Face is too close. Please move back.");
						setValidFace(false);
						return;
					}

					// Checking for head Orientation
					if (
						!isHeadOrientationValid(
							landmarks,
							video.videoWidth,
							video.videoHeight
						)
					) {
						setFeedback(
							"Head orientation is invalid. Adjust your face."
						);
						setValidFace(false);
						return;
					}

					// Validate if the face is centered
					if (
						!isFaceCentered(
							face,
							video.videoWidth,
							video.videoHeight
						)
					) {
						setFeedback(
							"Face is not centered. Please adjust your position."
						);
						setValidFace(false);
						return;
					}

					// If all validations pass, trigger onValidFace
					setFeedback(
						"Face is in the correct position! Hold still..."
					);
					setValidFace((prevState) => {
						if (!prevState) {
							// Only start the countdown when the face becomes valid
							startCountdown(3);
						}
						return true;
					});
				} else {
					setFeedback(
						"No face detected. Please position your face properly."
					);
					setValidFace((prevState) => {
						if (prevState) stopCountdown();
						return false;
					});
				}
			};

			faceDetector.onResults(async (results) => {
				await detectFacesAsync(results); // Run the validations on the detected faces
			});

			const camera = new Camera(videoRef.current, {
				onFrame: async () => {
					await faceDetector.send({ image: videoRef.current });
				},
				width: 640,
				height: 480,
			});

			camera.start();

			return () => {
				camera.stop();
			};
		}
	}, [videoRef]);

	return (
		<div>
			<p style={{ color: validFace ? "green" : "red" }}>{feedback}</p>

			{countdown !== null && (
				<p style={{ color: "blue" }}>Capturing in {countdown}...</p>
			)}
		</div>
	);
};

export default FaceDetectionComponent;
