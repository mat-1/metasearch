const notepadRegex = /^(python|js|javascript|html|xml|code)? ?(note ?pad|text ?(area|editor)|editor)$/i


export async function request(query) {
	const regexMatch = query.match(notepadRegex)
	if (!regexMatch) return {}
	return {
		answer: {
			template: 'notepad'
		}
	}
}

export const weight = 2