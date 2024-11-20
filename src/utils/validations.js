const TOO_DARK_THRESHOLD = 60;
const TOO_BRIGHT_THRESHOLD = 200;

/**
 * Calculates the brightness of a video frame by averaging the RGB values of the pixels.
 * @param {HTMLCanvasElement} canvas - The canvas element used to draw the video frame.
 * @returns {number|null} The calculated brightness value, or null if calculation fails.
 */
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

/**
 * Determines if the video frame is too dark or too bright based on predefined thresholds.
 * @param {HTMLVideoElement} video - The video element from which to extract the frame.
 * @returns {Object} An object indicating whether the frame is too dark or too bright.
 */
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

/**
 * Checks if more than one face is detected in the given detections array.
 * @param {Array} detections - The array of face detection results.
 * @returns {boolean} True if more than one face is detected, false otherwise.
 */
export const hasMultipleFaces = (detections) => {
	return detections.length > 1;
};

/**
 * Validates the distance of the face in the frame based on the bounding box width.
 * @param {Object} face - The face detection result.
 * @returns {string} A string indicating whether the face is too close, too far, or valid.
 */
export const isFaceDistanceValid = (face) => {
	if (!face || !face.boundingBox) {
		return "invalid";
	}

	const distance = face.boundingBox.width;

	if (distance < 0.1) {
		return "too close";
	}
	if (distance > 0.5) {
		return "too far";
	}
	return "valid";
};

/**
 * Checks if the face is centered in the video frame, within a defined tolerance.
 * @param {Object} face - The face detection result.
 * @param {number} videoWidth - The width of the video frame.
 * @param {number} videoHeight - The height of the video frame.
 * @returns {boolean} True if the face is within the tolerance of the center, false otherwise.
 */
export const isFaceCentered = (face, videoWidth, videoHeight) => {
	// Ensure all necessary data is available
	if (!face || !face.boundingBox) {
		return false; // Return false if the data is missing
	}

	// Get the relative bounding box of the face
	const { xCenter, yCenter, width, height } = face.boundingBox;

	// Calculate the center of the face based on relative bounding box
	const faceCenterX = xCenter;
	const faceCenterY = yCenter;

	// Convert relative center to absolute pixel coordinates
	const faceCenterXInPixels = faceCenterX * videoWidth;
	const faceCenterYInPixels = faceCenterY * videoHeight;

	// Find the center of the video frame
	const horizontalCenter = videoWidth / 2;
	const verticalCenter = videoHeight / 2;

	// Define acceptable tolerance for centering (in percentage of video dimensions)
	const tolerance = 0.2; // 20% tolerance
	const horizontalTolerance = horizontalCenter * tolerance;
	const verticalTolerance = verticalCenter * tolerance;

	// Check if the face center is within the tolerance range of the video center

	return (
		Math.abs(faceCenterXInPixels - horizontalCenter) <
			horizontalTolerance &&
		Math.abs(faceCenterYInPixels - verticalCenter) < verticalTolerance
	);
};

export const isHeadOrientationValid = (landmarks, videoWidth, videoHeight) => {
	if (!landmarks || landmarks.length === 0) {
		return false;
	}

	// Example landmarks: left eye, right eye, and nose
	const leftEye = landmarks[1];
	const rightEye = landmarks[0];
	const nose = landmarks[2];

	// Calculate relative positions
	const eyeDistanceX = Math.abs(leftEye.x - rightEye.x);
	const eyeDistanceY = Math.abs(leftEye.y - rightEye.y);

	// Detect yaw (horizontal head turn)
	const yawThreshold = 0.1; // Allow a small deviation
	const isYawValid = eyeDistanceY / eyeDistanceX < yawThreshold;

	// Detect pitch (up/down tilt) using the nose relative to eyes
	const pitchThreshold = 0.2; // Allowable nose deviation
	const isPitchValid =
		Math.abs(nose.y - (leftEye.y + rightEye.y) / 2) < pitchThreshold;

	// Check for roll (side tilt) using eye alignment
	const rollThreshold = 0.1;
	const isRollValid = Math.abs(leftEye.y - rightEye.y) < rollThreshold;

	// Face orientation is valid if all criteria are met
	return isYawValid && isPitchValid && isRollValid;
};
