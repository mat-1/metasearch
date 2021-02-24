import { parseResultList } from '../../parser'
import { EngineResponse } from '../../search'

export async function request(query): Promise<EngineResponse> {
	return await parseResultList('https://html.duckduckgo.com/html?q=' + encodeURIComponent(query), {
		resultItemPath: '.result',
		titlePath: 'h2',
		hrefPath: 'h2 > a',
		contentPath: '.result__snippet',

		// this is disabled because the answers are low quality
		// suggestionPath: '#did_you_mean > a:first-of-type'
	})
}

export const weight = 1.01
