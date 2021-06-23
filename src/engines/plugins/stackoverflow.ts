import { requestDom, get, extractText, extractHref } from '../../parser'
import { Options } from '../../search'

const stackOverflowHost: string = 'https://stackoverflow.com'

export async function runPlugin({ id }: { id: string }) {
	const originalUrl = `${stackOverflowHost}/questions/${id}`
	const dom = await requestDom(originalUrl)

	const body: cheerio.Cheerio = dom('body')

	const answerContainerEl = get(body, 'div.answer.accepted-answer')
	if (answerContainerEl.html() == null)
		// no accepted answer :(
		return false
		
	const title = extractText(body, 'h1.fs-headline1 a.question-hyperlink')

	let url = stackOverflowHost + extractHref(body, '.question-hyperlink')
	
	const answerId = answerContainerEl.attr('data-answerid')
	const answerEl = get(answerContainerEl, 'div.answercell > div.js-post-body')
	url = url + '#' + answerId
	return {
		html: answerEl.html()?.trim()?.replace(/\n/g, '\\n')?.replace(/`/g, '\\`') ?? '',
		url: url.replace(/`/g, '\\`'),
		title: title.replace(/`/g, '\\`'),
		originalUrl: originalUrl.replace(/`/g, '\\`')
	}
}

export async function changeOptions(options: Options) {
	if (options.answer && options.sidebar)
		// an answer was already returned from somewhere else
		return options

	for (let resultIndex = 0; resultIndex < options.results.length; resultIndex++) {
		const result = options.results[resultIndex]
		if (result.url.startsWith(stackOverflowHost + '/questions') && resultIndex <= 4) {
			// +1 to remove the extra slash
			const stackOverflowId = result.url.slice(stackOverflowHost.length + 1).split('/')[1]
			if (!options.plugins.stackoverflow)
				options.plugins.stackoverflow = {
					id: parseInt(stackOverflowId)
				}
		}
	}
	return options
}
