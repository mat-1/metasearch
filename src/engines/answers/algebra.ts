import solve from '../../math'

const weight = 1.1

export async function request(query) {
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


export { autoComplete, weight }
