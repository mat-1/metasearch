import { parseResultList, requestJSON } from '../../parser'
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


export async function autoComplete(query) {
	if (!query.trim()) return []
	const data = await requestJSON('https://search.brave.com/api/suggest?q=' + query)
	return data[1]
}


export const weight = 1.2
