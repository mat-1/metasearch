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

module.exports = { request }