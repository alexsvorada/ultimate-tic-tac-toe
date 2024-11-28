import { useRuntimeConfig } from '#imports'

export const logger = {
	log: (...args: any[]) => {
		if (useRuntimeConfig().isDev) {
			console.log(...args)
		}
	},
	warn: (...args: any[]) => {
		if (useRuntimeConfig().isDev) {
			console.warn(...args)
		}
	},
	error: (...args: any[]) => {
		console.error(...args)
	},
}
