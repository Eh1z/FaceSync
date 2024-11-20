export const asyncWrapper = (func) => {
	return async (...args) => {
		try {
			const result = await func(...args); // Await the async function here
			return result; // Return the result when the promise resolves
		} catch (error) {
			throw error; // Throw the error to be handled by the caller
		}
	};
};
