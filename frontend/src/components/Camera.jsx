// src/components/Camera.jsx
import React, {
	useRef,
	useEffect,
	forwardRef,
	useImperativeHandle,
	useState,
} from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera as MediaCamera } from "@mediapipe/camera_utils";
import { toast } from "react-toastify"; // Import toast for notifications

const CameraComponent = forwardRef(({ onFaceDetected }, ref) => {
	const videoRef = useRef(null);
	const cameraInstance = useRef(null);
	const faceMesh = useRef(null);
	const offscreenCanvasRef = useRef(null);

	// State variables for validations
	const [isTooDark, setIsTooDark] = useState(false);
	const [isTooBright, setIsTooBright] = useState(false);
	const [isMultipleFaces, setIsMultipleFaces] = useState(false);
	const [isFaceCutoff, setIsFaceCutoff] = useState(false);
	const [isFaceTooClose, setIsFaceTooClose] = useState(false);
	const [isFaceTooFar, setIsFaceTooFar] = useState(false);
	const [isFaceCentered, setIsFaceCentered] = useState(false);
	const [areEyesClosed, setAreEyesClosed] = useState(false);

	// Ref to store toast IDs to prevent duplicate toasts
	const toastIds = useRef({
		isTooDark: null,
		isTooBright: null,
		isMultipleFaces: null,
		isFaceCutoff: null,
		isFaceTooClose: null,
		isFaceTooFar: null,
		isFaceCentered: null,
		areEyesClosed: null,
	});

	// Implementing the capture method
	useImperativeHandle(ref, () => ({
		capture: () => {
			const video = videoRef.current;
			if (!video) {
				console.error("Video element not found.");
				return null;
			}

			// Ensure the video is ready
			if (video.readyState < 2) {
				console.error("Video not ready for capture.");
				return null;
			}

			// Create a canvas to capture the current frame
			const canvas = document.createElement("canvas");
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			const dataURL = canvas.toDataURL("image/png");
			return dataURL;
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

		if (!videoRef.current) {
			console.error("Video reference is missing");
			return;
		}

		const videoElement = videoRef.current;

		// Create offscreen canvas for brightness calculation
		const offscreenCanvas = document.createElement("canvas");
		const offscreenCtx = offscreenCanvas.getContext("2d");
		offscreenCanvasRef.current = offscreenCanvas;

		// Define landmark connections based on MediaPipe Face Mesh documentation
		const FACEMESH_TESSELATION = [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			// ... (Add all necessary connections)
		];
		const FACEMESH_RIGHT_EYE = [
			[33, 7],
			[7, 163],
			[163, 144],
			// ... (Add all necessary connections)
		];
		const FACEMESH_LEFT_EYE = [
			[362, 382],
			[382, 381],
			[381, 380],
			// ... (Add all necessary connections)
		];
		const FACEMESH_FACE_OVAL = [
			[10, 338],
			[338, 297],
			[297, 332],
			// ... (Add all necessary connections)
		];
		const FACEMESH_LIPS = [
			[78, 95],
			[95, 88],
			[88, 178],
			// ... (Add all necessary connections)
		];
		const FACEMESH_IRISES = [
			[474, 475],
			[475, 476],
			[476, 477],
			[477, 474], // Right Iris
			[469, 470],
			[470, 471],
			[471, 472],
			[472, 469], // Left Iris
		];

		// Aggregate all connections into one array for easier processing if needed
		const connections = [
			...FACEMESH_TESSELATION,
			...FACEMESH_RIGHT_EYE,
			...FACEMESH_LEFT_EYE,
			...FACEMESH_FACE_OVAL,
			...FACEMESH_LIPS,
			...FACEMESH_IRISES,
		];

		// Initialize FaceMesh
		const initializeFaceMesh = () => {
			faceMesh.current = new FaceMesh({
				locateFile: (file) =>
					`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
			});

			faceMesh.current.setOptions({
				maxNumFaces: 1, // Set to 1 to detect only one face
				refineLandmarks: true,
				minDetectionConfidence: 0.7, // Increased for better accuracy
				minTrackingConfidence: 0.7, // Increased for better tracking
			});

			faceMesh.current.onResults(handleResults);

			console.log("FaceMesh initialized successfully.");
		};

		// Function to compute average brightness
		const computeAverageBrightness = (imageData) => {
			let sum = 0;
			const data = imageData.data;
			const numPixels = data.length / 4;

			for (let i = 0; i < data.length; i += 4) {
				// Convert to grayscale using luminance formula
				const brightness =
					0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
				sum += brightness;
			}

			return sum / numPixels;
		};

		// Function to compute Eye Aspect Ratio (EAR)
		const computeEAR = (landmarks, eyeIndices) => {
			const vertical1 = Math.hypot(
				landmarks[eyeIndices[1]].x - landmarks[eyeIndices[5]].x,
				landmarks[eyeIndices[1]].y - landmarks[eyeIndices[5]].y
			);
			const vertical2 = Math.hypot(
				landmarks[eyeIndices[2]].x - landmarks[eyeIndices[4]].x,
				landmarks[eyeIndices[2]].y - landmarks[eyeIndices[4]].y
			);
			const horizontal = Math.hypot(
				landmarks[eyeIndices[0]].x - landmarks[eyeIndices[3]].x,
				landmarks[eyeIndices[0]].y - landmarks[eyeIndices[3]].y
			);

			const ear = (vertical1 + vertical2) / (2.0 * horizontal);
			return ear;
		};

		// Thresholds
		const BRIGHTNESS_THRESHOLD_DARK = 50; // Adjust based on testing
		const BRIGHTNESS_THRESHOLD_BRIGHT = 200; // Adjust based on testing
		const EAR_THRESHOLD = 0.25; // Below this indicates eyes closed
		const FACE_SIZE_THRESHOLD_CLOSE = 0.5; // Adjust based on testing
		const FACE_SIZE_THRESHOLD_FAR = 0.2; // Adjust based on testing
		const FACE_CENTER_THRESHOLD = 0.1; // 10% deviation

		// Handle FaceMesh results
		const handleResults = (results) => {
			console.log("FaceMesh results:", results);

			if (!results.image) {
				console.error("No image in results.");
				return;
			}

			offscreenCanvas.width = results.image.width;
			offscreenCanvas.height = results.image.height;
			offscreenCtx.drawImage(
				results.image,
				0,
				0,
				offscreenCanvas.width,
				offscreenCanvas.height
			);

			// Compute brightness
			const imageData = offscreenCtx.getImageData(
				0,
				0,
				offscreenCanvas.width,
				offscreenCanvas.height
			);
			const averageBrightness = computeAverageBrightness(imageData);
			setIsTooDark(averageBrightness < BRIGHTNESS_THRESHOLD_DARK);
			setIsTooBright(averageBrightness > BRIGHTNESS_THRESHOLD_BRIGHT);

			// Check for multiple faces
			if (results.multiFaceLandmarks.length > 1) {
				setIsMultipleFaces(true);
			} else {
				setIsMultipleFaces(false);
			}

			if (results.multiFaceLandmarks.length > 0) {
				const landmarks = results.multiFaceLandmarks[0]; // First detected face
				onFaceDetected(landmarks);

				// Check if face is cutoff
				const margin = 0.05; // 5% margin
				const isCutoff = landmarks.some(
					(lm) =>
						lm.x < margin ||
						lm.x > 1 - margin ||
						lm.y < margin ||
						lm.y > 1 - margin
				);
				setIsFaceCutoff(isCutoff);

				// Compute face size based on inter-eye distance
				const leftEye = landmarks[33];
				const rightEye = landmarks[263];
				const interEyeDistance = Math.hypot(
					rightEye.x - leftEye.x,
					rightEye.y - leftEye.y
				);
				setIsFaceTooClose(interEyeDistance > FACE_SIZE_THRESHOLD_CLOSE);
				setIsFaceTooFar(interEyeDistance < FACE_SIZE_THRESHOLD_FAR);

				// Check if face is centered
				const faceCenterX =
					landmarks.reduce((sum, lm) => sum + lm.x, 0) /
					landmarks.length;
				const faceCenterY =
					landmarks.reduce((sum, lm) => sum + lm.y, 0) /
					landmarks.length;
				const deviationX = Math.abs(faceCenterX - 0.5);
				const deviationY = Math.abs(faceCenterY - 0.5);
				setIsFaceCentered(
					deviationX < FACE_CENTER_THRESHOLD &&
						deviationY < FACE_CENTER_THRESHOLD
				);

				// Check if eyes are closed
				const EAR_LEFT = computeEAR(
					landmarks,
					[33, 160, 158, 133, 153, 144]
				);
				const EAR_RIGHT = computeEAR(
					landmarks,
					[362, 385, 387, 263, 373, 380]
				);
				setAreEyesClosed(
					EAR_LEFT < EAR_THRESHOLD || EAR_RIGHT < EAR_THRESHOLD
				);
			} else {
				// No faces detected
				onFaceDetected(null);
				setIsFaceCutoff(false);
				setIsMultipleFaces(false);
				setIsFaceTooClose(false);
				setIsFaceTooFar(false);
				setIsFaceCentered(false);
				setAreEyesClosed(false);
			}
		};

		initializeFaceMesh();

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
			if (faceMesh.current) {
				faceMesh.current.close();
				console.log("FaceMesh closed on unmount.");
			}
		};
	}, [onFaceDetected]);

	// useEffect hooks for toasts
	useEffect(() => {
		if (isTooDark) {
			if (!toastIds.current.isTooDark) {
				toastIds.current.isTooDark = toast.error(
					"The environment is too dark. Please increase the lighting.",
					{ toastId: "isTooDark" }
				);
			}
		} else {
			if (toastIds.current.isTooDark) {
				toast.dismiss(toastIds.current.isTooDark);
				toastIds.current.isTooDark = null;
			}
		}
	}, [isTooDark]);

	useEffect(() => {
		if (isTooBright) {
			if (!toastIds.current.isTooBright) {
				toastIds.current.isTooBright = toast.error(
					"The environment is too bright. Please reduce the lighting.",
					{ toastId: "isTooBright" }
				);
			}
		} else {
			if (toastIds.current.isTooBright) {
				toast.dismiss(toastIds.current.isTooBright);
				toastIds.current.isTooBright = null;
			}
		}
	}, [isTooBright]);

	useEffect(() => {
		if (isMultipleFaces) {
			if (!toastIds.current.isMultipleFaces) {
				toastIds.current.isMultipleFaces = toast.error(
					"Multiple faces detected. Please ensure only one face is in the frame.",
					{ toastId: "isMultipleFaces" }
				);
			}
		} else {
			if (toastIds.current.isMultipleFaces) {
				toast.dismiss(toastIds.current.isMultipleFaces);
				toastIds.current.isMultipleFaces = null;
			}
		}
	}, [isMultipleFaces]);

	useEffect(() => {
		if (isFaceCutoff) {
			if (!toastIds.current.isFaceCutoff) {
				toastIds.current.isFaceCutoff = toast.error(
					"Part of the face is out of the frame. Please adjust your position.",
					{ toastId: "isFaceCutoff" }
				);
			}
		} else {
			if (toastIds.current.isFaceCutoff) {
				toast.dismiss(toastIds.current.isFaceCutoff);
				toastIds.current.isFaceCutoff = null;
			}
		}
	}, [isFaceCutoff]);

	useEffect(() => {
		if (isFaceTooClose) {
			if (!toastIds.current.isFaceTooClose) {
				toastIds.current.isFaceTooClose = toast.warn(
					"Your face is too close to the camera. Please move back.",
					{ toastId: "isFaceTooClose" }
				);
			}
		} else {
			if (toastIds.current.isFaceTooClose) {
				toast.dismiss(toastIds.current.isFaceTooClose);
				toastIds.current.isFaceTooClose = null;
			}
		}
	}, [isFaceTooClose]);

	useEffect(() => {
		if (isFaceTooFar) {
			if (!toastIds.current.isFaceTooFar) {
				toastIds.current.isFaceTooFar = toast.warn(
					"Your face is too far from the camera. Please move closer.",
					{ toastId: "isFaceTooFar" }
				);
			}
		} else {
			if (toastIds.current.isFaceTooFar) {
				toast.dismiss(toastIds.current.isFaceTooFar);
				toastIds.current.isFaceTooFar = null;
			}
		}
	}, [isFaceTooFar]);

	useEffect(() => {
		if (!isFaceCentered) {
			if (!toastIds.current.isFaceCentered) {
				toastIds.current.isFaceCentered = toast.warn(
					"Please center your face within the frame.",
					{ toastId: "isFaceCentered" }
				);
			}
		} else {
			if (toastIds.current.isFaceCentered) {
				toast.dismiss(toastIds.current.isFaceCentered);
				toastIds.current.isFaceCentered = null;
			}
		}
	}, [isFaceCentered]);

	useEffect(() => {
		if (areEyesClosed) {
			if (!toastIds.current.areEyesClosed) {
				toastIds.current.areEyesClosed = toast.error(
					"Eyes detected as closed. Please open your eyes for accurate detection.",
					{ toastId: "areEyesClosed" }
				);
			}
		} else {
			if (toastIds.current.areEyesClosed) {
				toast.dismiss(toastIds.current.areEyesClosed);
				toastIds.current.areEyesClosed = null;
			}
		}
	}, [areEyesClosed]);

	return (
		<div className="relative w-full bg-white mb-6">
			<div className="flex justify-center items-center w-full">
				{/* Circular Video */}
				<video
					ref={videoRef}
					className="w-60 h-60 object-cover rounded-full border-4 border-green-500 border-dashed"
					autoPlay
					muted
					playsInline
				></video>
			</div>
		</div>
	);
});

export default CameraComponent;
