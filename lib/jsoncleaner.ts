export const clean = (text: string): string =>
	text
		.replace(/```json/gi, '')
		.replace(/```/gi, '')
		.trim() as string
