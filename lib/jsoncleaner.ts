export const clean = (text: string | null | undefined): string => {
	if (!text) return ''
	return text
		.replace(/```json/gi, '')
		.replace(/```/gi, '')
		.trim()
}
