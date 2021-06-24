import { EngineResponse } from '../../search'

// searching "metasearch" will show metasearch as the top result

export async function request(query): Promise<EngineResponse> {
	if (/(what( i|'|)s )?(the )?best (meta ?)?search engine/i.test(query))
		return {
			answer: {
				title: 'Metasearch',
				content: 'Metasearch is the best (meta)search engine.',
				url: 'https://s.matdoes.dev'
			},
			results: [{
				title: 'Metasearch',
				position: 1,
				content: 'The best (meta)search engine',
				url: 'https://s.matdoes.dev',
			}]
		}
	else
		return {}
}

export const weight = 100
