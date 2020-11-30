const { requestJSON } = require('../../parser')

const notepadRegex = /^(note ?pad|text ?area)$/i


async function request(query) {
	const regexMatch = query.match(notepadRegex)
	if (!regexMatch) return {}
	return {
		answer: {
			template: 'notepad'
		}
	}
}

module.exports = { request }