import { parseResultList, requestJSON } from '../../parser'
import { EngineRequest } from '../../search'

export async function request(query): Promise<EngineRequest> {
	return await parseResultList('https://www.google.com/search?nfpr=1&q=' + encodeURIComponent(query), {
		resultItemPath: 'div.g',
		titlePath: 'h3 > span',
		hrefPath: 'div.yuRUbf > a[href], h3.H1u2de > a[href]',
		contentPath: 'div.IsZvec',
		suggestionPath: 'p.card-section a:first-of-type',

		featuredSnippetPath: '.c2xzTb',
		featuredSnippetContentPath: '.hgKElcm, .X5LH0c, .LGOjhe, .iKJnec',
		featuredSnippetTitlePath: 'div.rc a > h3',
		featuredSnippetHrefPath: 'div.rc a',
	})
}

export async function autoComplete(query) {
	if (!query.trim()) return []
	const data = await requestJSON('https://suggestqueries.google.com/complete/search?output=firefox&client=firefox&hl=US-en&q=' + query)
	const results = []
	for (const suggestion of data[1])
		results.push(suggestion)
	return results
}

export const weight = 1.05
