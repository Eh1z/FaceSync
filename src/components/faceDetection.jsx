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

const FaceDetectionComponent = ({ videoRef }) => {
	const [feedback, setFeedback] = useState(""); // Store feedback for UI display
	const [validFace, setValidFace] = useState(false); // Track valid/invalid face
	const [countdown, setCountdown] = useState(null); // Countdown state
	const [capturedImage, setCapturedImage] = useState(null); // Captured image state
	const timerRef = useRef(null); // Ref to store the timer ID
	const canvasRef = useRef(null); // Ref to the canvas element for capturing
	const countdownActiveRef = useRef(false); // Tracks countdown status

	// Starts the countdown
	const startCountdown = (duration) => {
		if (countdownActiveRef.current || capturedImage) return; // Prevent redundant countdowns
		countdownActiveRef.current = true;
		setCountdown(duration);
		if (timerRef.current) clearInterval(timerRef.current);

		timerRef.current = setInterval(() => {
			setCountdown((prev) => {
				if (prev > 1 && validFace) {
					return prev - 1;
				} else {
					clearInterval(timerRef.current);
					countdownActiveRef.current = false;
					captureFrame(); // Automatically capture the frame
					return null; // Stop the countdown
				}
			});
		}, 1000);
	};

	// Stops the countdown
	const stopCountdown = () => {
		setCountdown(null);
		if (timerRef.current) clearInterval(timerRef.current);
		countdownActiveRef.current = false;
	};

	// Capture current video frame
	const captureFrame = () => {
		const videoElement = videoRef.current;
		const canvas = canvasRef.current;

		if (videoElement && canvas) {
			const context = canvas.getContext("2d");
			canvas.width = videoElement.videoWidth;
			canvas.height = videoElement.videoHeight;

			context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

			const imageData = canvas.toDataURL("image/png");
			setCapturedImage(imageData);
			setFeedback("Frame captured successfully!");
			stopCountdown();
		}
	};

	// Retake the image
	const retakeImage = () => {
		setCapturedImage(null);
		setFeedback("Please position your face for another capture.");
	};

	// Handle `validFace` changes
	useEffect(() => {
		if (validFace) {
			startCountdown(3);
		} else {
			stopCountdown();
		}
	}, [validFace]);

	// Handles Face Detection Logic
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
				if (capturedImage !== null) {
					// If an image is already captured, skip further face detection
					return;
				}
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
					setValidFace(true);
				} else {
					setFeedback(
						"No face detected. Please position your face properly."
					);
					setValidFace(false);
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
			<div className="flex justify-center items-center w-full ">
				<p
					className={`p-3 bg-[#FED09B]  transition rounded-lg mt-5 text-sm ${
						validFace && "bg-green-300"
					}`}
				>
					{feedback}
				</p>
			</div>

			{countdown !== null && (
				<p className="text-6xl  absolute top-[35%] left-[50%] text-white">
					{countdown}
				</p>
			)}

			{/* Display captured image or live video */}
			{capturedImage && (
				<div className="absolute top-0 left-0 w-full h-screen flex flex-col justify-center items-center gap-8 bg-white">
					<img
						src={capturedImage}
						alt="Captured Frame"
						style={{ width: "100%", maxWidth: "400px" }}
					/>
					<div className=" flex gap-8 items-center justify-center py-16">
						<button
							className="py-2 px-8 bg-blue-800 rounded text-white"
							onClick={retakeImage}
						>
							Retake
						</button>
						<button className="py-2 px-8 bg-blue-800 rounded text-white">
							Proceed
						</button>
					</div>
				</div>
			)}

			{/* Canvas used for capturing image */}
			<canvas ref={canvasRef} style={{ display: "none" }} />
		</div>
	);
};

export default FaceDetectionComponent;
