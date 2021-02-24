import { EngineResponse } from '../../search'

// searching "metasearch" will show metasearch as the top result

export async function request(query): Promise<EngineResponse> {
	if (query.toLowerCase() === 'metasearch')
		return {
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
