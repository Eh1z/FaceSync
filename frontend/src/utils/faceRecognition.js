// src/utils/faceRecognition.js
export const compareFaces = (face1, face2) => {
	if (!face1 || !face2 || face1.length !== face2.length) return false;

	let totalDistance = 0;
	for (let i = 0; i < face1.length; i++) {
		const dx = face1[i].x - face2[i].x;
		const dy = face1[i].y - face2[i].y;
		const dz = face1[i].z - face2[i].z;
		totalDistance += Math.sqrt(dx * dx + dy * dy + dz * dz);
	}
	const averageDistance = totalDistance / face1.length;
	const threshold = 0.1; // Adjust based on testing
	return averageDistance < threshold;
};
