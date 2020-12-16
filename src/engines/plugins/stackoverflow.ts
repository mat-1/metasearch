import { requestDom, get, extractText, extractHref } from '../../parser'

const stackOverflowHost: string = 'https://stackoverflow.com/'

export async function runPlugin({ id }) {
	const originalUrl = `${stackOverflowHost}questions/${id}`
	const dom = await requestDom(originalUrl)
	const answerContainerEl = get(dom, 'div.answer.accepted-answer')
	if (answerContainerEl.html() == null)
		// no accepted answer :(
		return false
		
	const title = extractText(dom, 'h1.fs-headline1 a.question-hyperlink')

	let url = stackOverflowHost + extractHref(dom, '.question-hyperlink')
	
	let answerId = answerContainerEl.attr('data-answerid')
	let answerEl = get(answerContainerEl, 'div.answercell > div.js-post-body')
	url = url + '#' + answerId
	return {
		html: answerEl.html().trim().replace(/\n/g, '\\n').replace(/`/g, '\\`'),
		url: url.replace(/`/g, '\\`'),
		title: title.replace(/`/g, '\\`'),
		originalUrl: originalUrl.replace(/`/g, '\\`')
	}
}

export async function changeOptions(options) {
	if (options.answer.length > 0 || options.sidebar.length > 0)
		// an answer was already returned from somewhere else
		return options

	for (let resultIndex = 0; resultIndex < options.results.length; resultIndex++) {
		let result = options.results[resultIndex]
		if (result.url.startsWith(stackOverflowHost + 'questions') && resultIndex < 5) {
			let stackOverflowId = result.url.slice(stackOverflowHost.length).split('/')[1]
			if (!options.plugins.stackoverflow)
				options.plugins.stackoverflow = {
					id: parseInt(stackOverflowId)
				}
		}
	}
	return options
}
