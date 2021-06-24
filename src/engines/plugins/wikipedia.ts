import { requestJSON } from '../../parser'
import { Options } from '../../search'

const wikipediaPrefix: string = 'https://en.wikipedia.org/wiki/'

export async function runPlugin({ urlTitle }: { urlTitle: string }) {
	const summaryJson = await requestJSON('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts|pageimages&exintro&explaintext&redirects=1&exsentences=2&titles=' + encodeURIComponent(urlTitle))
	const pages = summaryJson.query.pages
	const pageId = Object.keys(pages)[0]
	if (pageId == '-1') return {}
	const article = pages[pageId]

	if (article.extract.endsWith(':'))
		return {}

	return {
		title: article.title,
		content: article.extract,
		image: article.thumbnail ? article.thumbnail.source : undefined,
		url: 'https://en.wikipedia.org/wiki/' + article.title.replace(' ', '_')
	}
}

export async function changeOptions(options: Options) {
	if (options.answer && options.sidebar)
		// an answer was already returned from somewhere else
		return options

	for (let resultIndex = 0; resultIndex < Math.max(10, options.results.length); resultIndex++) {
		const result = options.results[resultIndex]
		if (result?.url?.startsWith(wikipediaPrefix)) {
			const wikipediaArticleTitle = result.url.slice(wikipediaPrefix.length)
            options.plugins.wikipedia = {
                urlTitle: wikipediaArticleTitle
            }
            break
		}
	}
	return options
}
