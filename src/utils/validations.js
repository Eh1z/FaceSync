// Constants for brightness thresholds
const TOO_DARK_THRESHOLD = 60;
const TOO_BRIGHT_THRESHOLD = 200;

// Get the brightness of the video frame
export const getFrameBrightness = (canvas) => {
	const ctx = canvas.getContext("2d");

	if (!ctx) return null;

	let colorSum = 0;

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	let r, g, b, avg;

	for (let x = 0, len = data.length; x < len; x += 4) {
		r = data[x];
		g = data[x + 1];
		b = data[x + 2];

		avg = Math.floor((r + g + b) / 3);
		colorSum += avg;
	}

	const brightness = Math.floor(colorSum / (canvas.width * canvas.height));
	return brightness;
};

// Check if the frame is too dark or too bright
export const isTooDarkOrTooBright = (video) => {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;

	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

	const brightness = getFrameBrightness(canvas);

	let isTooDark = false;
	let isTooBright = false;

	if (brightness === null) return { isTooDark, isTooBright };

	if (brightness < TOO_DARK_THRESHOLD) {
		isTooDark = true;
	} else if (brightness > TOO_BRIGHT_THRESHOLD) {
		isTooBright = true;
	}

	return { isTooDark, isTooBright };
};

// Check if there are multiple faces detected
export const hasMultipleFaces = (detections) => {
	return detections.length > 1;
};

// Check if the face is at a valid distance
export const isFaceDistanceValid = (face) => {
	const distance = face.locationData.relativeBoundingBox.width;
	if (distance < 0.1) {
		return "too close"; // Too close to the camera
	}
	if (distance > 0.5) {
		return "too far"; // Too far from the camera
	}
	return "valid"; // Valid distance
};

// Check if the face is centered in the frame
export const isFaceCentered = (face, videoWidth, videoHeight) => {
	const faceCenterX =
		face.locationData.relativeBoundingBox.left +
		face.locationData.relativeBoundingBox.width / 2;
	const faceCenterY =
		face.locationData.relativeBoundingBox.top +
		face.locationData.relativeBoundingBox.height / 2;

	const horizontalCenter = videoWidth / 2;
	const verticalCenter = videoHeight / 2;

	// Define a tolerance threshold for center alignment (adjust as needed)
	const tolerance = 0.1;
	const horizontalTolerance = horizontalCenter * tolerance;
	const verticalTolerance = verticalCenter * tolerance;

	return (
		Math.abs(faceCenterX * videoWidth - horizontalCenter) <
			horizontalTolerance &&
		Math.abs(faceCenterY * videoHeight - verticalCenter) < verticalTolerance
	);
};

// Check if the eyes are open based on the face landmarks (simplified check)
export const areEyesOpen = (face) => {
	const leftEye = face.keypoints.find((point) => point.name === "left_eye");
	const rightEye = face.keypoints.find((point) => point.name === "right_eye");

	// A simple check if the eye landmarks are visible (more sophisticated checks can be added here)
	if (!leftEye || !rightEye) return false;

	// You can use more detailed thresholds to check if the eyes are open by comparing eye landmarks
	const leftEyeOpen =
		leftEye.y > face.locationData.relativeBoundingBox.top + 0.1;
	const rightEyeOpen =
		rightEye.y > face.locationData.relativeBoundingBox.top + 0.1;

	return leftEyeOpen && rightEyeOpen;
};
