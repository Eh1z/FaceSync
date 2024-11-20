import React, { useEffect } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import {
	isTooDarkOrTooBright,
	hasMultipleFaces,
	isFaceDistanceValid,
	isFaceCentered,
	areEyesOpen,
} from "../utils/validations"; // Import your validations

const FaceDetectionComponent = ({ videoRef, onValidFace, onInvalidFace }) => {
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

				if (isTooDark) {
					onInvalidFace(
						"The image is too dark. Please adjust the lighting."
					);
					return;
				}

				if (isTooBright) {
					onInvalidFace(
						"The image is too bright. Please adjust the lighting."
					);
					return;
				}

				// Check for multiple faces
				if (hasMultipleFaces(results.detections)) {
					onInvalidFace(
						"Multiple faces detected. Only one face is allowed."
					);
					return;
				}

				if (results.detections.length === 1) {
					const face = results.detections[0];

					// Validate face distance (too far or too close)
					const distanceValidation = isFaceDistanceValid(face);
					if (distanceValidation === "too far") {
						onInvalidFace("Face is too far. Please move closer.");
						return;
					}

					if (distanceValidation === "too close") {
						onInvalidFace("Face is too close. Please move back.");
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
						onInvalidFace(
							"Face is not centered. Please adjust your position."
						);
						return;
					}

					// Validate if the eyes are open
					if (!areEyesOpen(face)) {
						onInvalidFace(
							"Eyes are closed. Please open your eyes."
						);
						return;
					}

					// If all validations pass, trigger onValidFace
					onValidFace();
				} else {
					onInvalidFace(
						"No face detected. Please position your face properly."
					);
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

	return null;
};

export default FaceDetectionComponent;
