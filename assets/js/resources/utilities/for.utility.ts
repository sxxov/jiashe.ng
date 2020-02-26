/* eslint-disable no-extend-native */
export class ForUtility {
	addToArrayPrototype(): void {
		// non-standard, used by this to keep track of the singleton
		if (!(Array.prototype as any).__forUtilitySingletonExecuted) {
			(Array.prototype as any).__forUtilitySingletonExecuted = true;

			const methods = {
				forAwait: async (callback, ctx = null): Promise<void> => {
					const workingArray = (this as any);

					for (let i = 0, l = workingArray.length; i < l; ++i) {
						await callback.call(ctx || this, workingArray[i], i);
					}
				},
				getAll: (
					callback: (ctx: any[], item: any, i: number) => boolean,
					ctx = null,
				): any[] => {
					const workingArray = (this as any);
					const returnValues = [];

					for (let i = 0, l = workingArray.length; i < l; ++i) {
						if (callback.call(ctx || this, workingArray[i], i)) {
							returnValues.push(workingArray[i]);
						}
					}

					return returnValues;
				},
				getSome: (
					callback: (ctx: any[], item: any, i: number) => boolean,
					ctx = null,
				): any => {
					const workingArray = (this as any);

					for (let i = 0, l = workingArray.length; i < l; ++i) {
						if (callback.call(ctx || this, workingArray[i], i)) {
							return workingArray[i];
						}
					}

					return null;
				},
			};

			Object.keys(methods).forEach((key) => {
				Array.prototype[key] = methods[key];
			});
		}
	}
}
