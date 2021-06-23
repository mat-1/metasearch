import { parseResultList, requestJSON } from '../../parser'
import { EngineResponse } from '../../search'

export async function request(query): Promise<EngineResponse> {
	return await parseResultList('https://www.google.com/search?nfpr=1&q=' + encodeURIComponent(query), {
		resultItemPath: 'div.g',
		titlePath: 'h3.LC20lb',
		hrefPath: 'div.yuRUbf > a[href], h3.H1u2de > a[href]',
		contentPath: 'div.IsZvec',

		featuredSnippetPath: '.c2xzTb',
		featuredSnippetContentPath: '.hgKElcm, .X5LH0c, .LGOjhe, .iKJnec',
		featuredSnippetTitlePath: '.g > div > div a > h3',
		featuredSnippetHrefPath: '.g > div > div a',

		suggestionPath: 'a.gL9Hy'
	})
}

export async function autoComplete(query) {
	if (!query.trim()) return []
	const data = await requestJSON('https://suggestqueries.google.com/complete/search?output=firefox&client=firefox&hl=US-en&q=' + query)
	return data[1]
}

export const weight = 1.05
