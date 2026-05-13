export const clean = (text: any): string => {
	if (!text) return ''
	if (typeof text !== 'string') return ''
	return text
		.replace(/```json/gi, '')
		.replace(/```/gi, '')
		.trim()
}
