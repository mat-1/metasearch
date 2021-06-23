import { RequestOptions } from '../../search'

export async function request(query: string, req: RequestOptions) {
	if (query.toLowerCase().match(/^(what('s|s| is) my (user ?agent|ua)|ua|user ?agent)$/i)) {
		const escapedUA = req.req.headers?.['user-agent']
			?.replace(/</g, '&lt;')
			?.replace(/>/g, '&gt;')
		return {
			answer: {
				content: escapedUA ? `Your user agent is <b>${escapedUA}</b>` : 'You don\'t have a user agent!',
				template: 'html'
			}
		}
	} else
		return {}
}
