import { requestJSON } from '../../parser'
import { EngineResponse } from '../../search'

const wikipediaRegex = /^([^<>]+)$/i

export async function request(query: string): Promise<EngineResponse> {
	const regexMatch = query.match(wikipediaRegex)
	if (!regexMatch) return {}
	const wikipediaQuery = regexMatch[1]
	const summaryJson = await requestJSON('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts|pageimages&exintro&explaintext&redirects=1&exsentences=2&titles=' + encodeURIComponent(wikipediaQuery))
	const pages = summaryJson.query.pages
	const pageId = Object.keys(pages)[0]
	if (pageId == '-1') return {}
	const article = pages[pageId]

	if (article.extract.endsWith(':'))
		return {}

	return {
		sidebar: {
			title: article.title,
			content: article.extract,
			image: article.thumbnail ? article.thumbnail.source : undefined,
			url: 'https://en.wikipedia.org/wiki/' + article.title.replace(' ', '_')
		}
	}
}
