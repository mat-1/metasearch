import { parseResultList } from '../../parser'
import { EngineResponse } from '../../search'

export async function request(query): Promise<EngineResponse> {
	return await parseResultList('https://search.brave.com/search?q=' + encodeURIComponent(query), {
		resultItemPath: '#results > .fdb',
		titlePath: '.snippet-title',
		hrefPath: '.result-header',
		contentPath: '.snippet-description',

		suggestionPath: '.altered-query > .h6 > a',
	})
}

export const weight = 1.5 // brave's results are really good!
