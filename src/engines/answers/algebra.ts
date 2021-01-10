import solve from '../../math'


export async function request(query) {
	const answer = solve(query)
	if (answer && answer != query)
		return {
			answer: {
				content: answer
			}
		}
	else
		return {}
}

export async function autoComplete(query) {
	const answer = solve(query)
	if (answer)
		return ['= ' + answer]
	else
		return []
}


export const weight = 1.1
