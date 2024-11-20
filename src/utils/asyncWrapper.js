export const asyncWrapper = (func) => {
	return async (...args) => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				try {
					const result = func(...args);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			}, 0);
		});
	};
};
