import { parseResultList } from '../../parser'
import { EngineResponse } from '../../search'

// this is duckduckgo html and not normal duckduckgo since normal duckduckgo is way too slow, but html duckduckgo provides worse results

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

// weight is low because of the bad results
export const weight = .4
