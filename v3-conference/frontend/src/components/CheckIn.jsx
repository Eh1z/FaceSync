import React, { useState, useRef, useEffect } from "react";
import { getAttendees } from "../api"; // Update to use attendees API
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import * as faceapi from "@vladmandic/face-api";
import CameraComponent from "./Camera";

const CheckIn = ({ sessionId, setSessionId }) => {
	const [attendees, setAttendees] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [capturedImage, setCapturedImage] = useState(null);
	const [step, setStep] = useState("capturing");
	const [bestMatchLabel, setBestMatchLabel] = useState(null); // Store the best match label for attendance

	const cameraRef = useRef(null);
	const canvasRef = useRef(null);

	// Load face-api models and attendees on mount
	useEffect(() => {
		const init = async () => {
			try {
				// Fetch attendees and load face-api models
				const attendeesResponse = await getAttendees(sessionId); // Fetch attendees based on session
				setAttendees(attendeesResponse.data);
				console.log("fetched attendees: ", attendees);

				await Promise.all([
					faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
					faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
					faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
					faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
				]);
				console.log("Models loaded");
			} catch (error) {
				toast.error("Initialization failed");
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		init();
	}, [sessionId]);

	const handleCapture = () => {
		if (cameraRef.current) {
			const imageData = cameraRef.current.capture();
			if (imageData) {
				setCapturedImage(imageData);
				setStep("preview");
				cameraRef.current.stopCamera();
			} else {
				toast.error("Failed to capture image. Please try again.");
			}
		}
	};

	const processCapturedImage = async () => {
		if (!capturedImage || !canvasRef.current) return;

		// Create an Image element from the captured image data
		const img = new Image();
		img.src = capturedImage;
		await new Promise((resolve) => (img.onload = resolve));

		// Prepare canvas
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0, img.width, img.height);

		// Detect a single face with landmarks
		const useTinyModel = true;
		const detection = await faceapi
			.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks(useTinyModel)
			.withFaceDescriptor();

		if (!detection) {
			toast.error("No face detected in the captured image.");
			return;
		}

		// Draw bounding box around the detected face
		const { x, y, width, height } = detection.detection.box;
		ctx.strokeStyle = "lime";
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, width, height);

		// Build labeled face data from stored attendees (assumes each attendee has a faceDescriptor property)
		const labeledFaceDescriptors = attendees
			.filter((attendee) => attendee.faceData)
			.map(
				(attendee) =>
					new faceapi.LabeledFaceDescriptors(attendee.name, [
						new Float32Array(attendee.faceData),
					])
			);

		if (labeledFaceDescriptors.length === 0) {
			toast.error(
				"No stored face descriptors available for recognition."
			);
			return;
		}

		// Create a FaceMatcher with a threshold (0.6 is typical)
		const faceMatcher = new faceapi.FaceMatcher(
			labeledFaceDescriptors,
			0.6
		);

		// Use the face descriptor from the captured image for matching
		const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

		// Write the matching user name (or "unknown") above the bounding box
		setBestMatchLabel(bestMatch.label); // Set the label for the matched user
		ctx.font = "32px Arial";
		ctx.fillStyle = "lime";
		ctx.fillText(bestMatch.label, x, y - 10);
	};

	useEffect(() => {
		if (step === "preview" && capturedImage) {
			processCapturedImage();
		}
	}, [step, capturedImage]);

	const handleRetake = () => {
		setCapturedImage(null);
		setStep("capturing");
	};

	const handleConfirm = () => {
		if (bestMatchLabel !== "unknown") {
			// Find the user whose name matches the bestMatchLabel
			const matchedAttendee = attendees.find(
				(attendee) => attendee.name === bestMatchLabel
			);

			if (matchedAttendee) {
				// Use the attendee's _id (e.g., for marking attendance)
				setSessionId(matchedAttendee._id);
				toast.success(
					`${bestMatchLabel} marked as checked in for the session`
				);
			} else {
				toast.error("No matching attendee found.");
			}
		} else {
			toast.error("No matching attendee found.");
		}
	};

	return (
		<div className="w-full p-6 bg-white rounded-lg shadow-md">
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					{step === "capturing" && (
						<>
							<h2 className="mb-4 text-xl font-semibold text-gray-700">
								Capture Your Check-In Photo
							</h2>
							<CameraComponent ref={cameraRef} />
							<button
								onClick={handleCapture}
								className="w-full px-4 py-2 mt-4 text-white transition duration-200 bg-green-500 rounded-md hover:bg-green-600"
							>
								Capture
							</button>
						</>
					)}

					{step === "preview" && (
						<>
							<h2 className="mb-4 text-xl font-semibold text-gray-700">
								Review Check-In Photo
							</h2>
							<canvas ref={canvasRef} className="w-full" />
							<button
								onClick={handleRetake}
								className="w-full px-4 py-2 mt-4 text-white transition duration-200 bg-red-500 rounded-md hover:bg-red-600"
							>
								Retake
							</button>
							<button
								onClick={handleConfirm}
								className="w-full px-4 py-2 mt-4 text-white transition duration-200 bg-blue-500 rounded-md hover:bg-blue-600"
							>
								Confirm
							</button>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default CheckIn;
