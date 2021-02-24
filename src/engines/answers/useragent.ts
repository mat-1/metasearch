import type { Request as ExpressRequest } from 'express'

export async function request(query: string, req: ExpressRequest) {
	if (query.toLowerCase().match(/^(what('s|s| is) my (user ?agent|ua)|ua|user ?agent)$/i)) {
		const escapedUA = req.headers['user-agent']
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
		return {
			answer: {
				content: `Your user agent is <b>${escapedUA}</b>`,
				template: 'html'
			}
		}
	} else
		return {}
}
