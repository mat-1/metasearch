const { requestDom, get, extractText, extractHref } = require('../../parser')

let stackOverflowHost = 'https://stackoverflow.com/'

async function runPlugin({ id }) {
	let originalUrl = `${stackOverflowHost}questions/${id}`
	let dom = await requestDom(originalUrl)
	let answerContainerEl = get(dom, 'div.answer.accepted-answer')
	if (answerContainerEl.html() == null)
	// no accepted answer :(
		return false
		
	let title = extractText(dom, 'h1.fs-headline1 a.question-hyperlink')

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

async function changeOptions(options) {
	if (options.answer.length > 0 || options.sidebar.length > 0)
		// an answer was already returned from somewhere else
		return options

	for (let resultIndex in options.results) {
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

module.exports = { runPlugin, changeOptions }