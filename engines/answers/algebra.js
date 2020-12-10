const solve = require('../../math')

async function request(query) {
	const answer = solve(query)
	if (answer)
		return {
			answer: {
				content: answer
			}
		}
	else
		return {}
}

async function autoComplete(query) {
	const answer = solve(query)
	if (answer)
		return ['= ' + answer]
	else
		return []
}

module.exports.request = request
module.exports.autoComplete = autoComplete
module.exports.weight = 1.1
