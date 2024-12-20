// src/utils/faceRecognition.js

// Normalize landmarks
export const normalizeLandmarks = (landmarks) => {
	const centerX =
		landmarks.reduce((sum, lm) => sum + lm.x, 0) / landmarks.length;
	const centerY =
		landmarks.reduce((sum, lm) => sum + lm.y, 0) / landmarks.length;

	const centeredLandmarks = landmarks.map((lm) => ({
		x: lm.x - centerX,
		y: lm.y - centerY,
		z: lm.z, // Retain z if needed
	}));

	// Example indices for eyes; adjust based on actual landmark indices
	const leftEye = centeredLandmarks[33];
	const rightEye = centeredLandmarks[263];
	const interEyeDistance = Math.sqrt(
		Math.pow(rightEye.x - leftEye.x, 2) +
			Math.pow(rightEye.y - leftEye.y, 2)
	);

	const scale = interEyeDistance === 0 ? 1 : 1 / interEyeDistance;

	const scaledLandmarks = centeredLandmarks.map((lm) => ({
		x: lm.x * scale,
		y: lm.y * scale,
		z: lm.z * scale,
	}));

	return scaledLandmarks;
};

// Calculate Cosine Similarity
export const calculateCosineSimilarity = (landmarks1, landmarks2) => {
	const vectorA = landmarks1.flatMap((lm) => [lm.x, lm.y, lm.z]);
	const vectorB = landmarks2.flatMap((lm) => [lm.x, lm.y, lm.z]);

	const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
	const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
	const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

	if (magnitudeA === 0 || magnitudeB === 0) return 0;

	return dotProduct / (magnitudeA * magnitudeB);
};
