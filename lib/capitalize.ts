export function capitalize(text: string): string {
	if (text.includes('-'))
		return text
			.split('-')
			.map((eachText) => eachText.charAt(0).toUpperCase() + eachText.slice(1))
			.join(' ')
	else if (text.includes(', '))
		return text
			.split(', ')
			.map((eachText) => eachText.charAt(0).toUpperCase() + eachText.slice(1))
			.join(', ')
	else if (text.includes(','))
		return text
			.split(',')
			.map((eachText) => eachText.charAt(0).toUpperCase() + eachText.slice(1))
			.join(', ')
	else return text.charAt(0).toUpperCase() + text.slice(1)
}

export function decapitalize(text: string): string | string[] {
	return text.includes(', ')
		? text.split(', ').map((each) => each.toLowerCase().replace(' ', '-'))
		: text.toLowerCase().replace(' ', '-').trim()
}
