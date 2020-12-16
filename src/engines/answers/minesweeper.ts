const notepadRegex = /^minesweper$/i


export async function request(query) {
	const regexMatch = query.match(notepadRegex)
	if (!regexMatch) return {}
	return {
		answer: {
			template: 'minesweeper'
		}
	}
}
