"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeOptions = exports.runPlugin = void 0;
const parser_1 = require("../../parser");
const stackOverflowHost = 'https://stackoverflow.com/';
async function runPlugin({ id }) {
    const originalUrl = `${stackOverflowHost}questions/${id}`;
    const dom = await parser_1.requestDom(originalUrl);
    const body = dom('body');
    const answerContainerEl = parser_1.get(body, 'div.answer.accepted-answer');
    if (answerContainerEl.html() == null)
        // no accepted answer :(
        return false;
    const title = parser_1.extractText(body, 'h1.fs-headline1 a.question-hyperlink');
    let url = stackOverflowHost + parser_1.extractHref(body, '.question-hyperlink');
    let answerId = answerContainerEl.attr('data-answerid');
    let answerEl = parser_1.get(answerContainerEl, 'div.answercell > div.js-post-body');
    url = url + '#' + answerId;
    return {
        html: answerEl.html().trim().replace(/\n/g, '\\n').replace(/`/g, '\\`'),
        url: url.replace(/`/g, '\\`'),
        title: title.replace(/`/g, '\\`'),
        originalUrl: originalUrl.replace(/`/g, '\\`')
    };
}
exports.runPlugin = runPlugin;
async function changeOptions(options) {
    if (options.answer.length > 0 || options.sidebar.length > 0)
        // an answer was already returned from somewhere else
        return options;
    for (let resultIndex = 0; resultIndex < options.results.length; resultIndex++) {
        let result = options.results[resultIndex];
        if (result.url.startsWith(stackOverflowHost + 'questions') && resultIndex < 5) {
            let stackOverflowId = result.url.slice(stackOverflowHost.length).split('/')[1];
            if (!options.plugins.stackoverflow)
                options.plugins.stackoverflow = {
                    id: parseInt(stackOverflowId)
                };
        }
    }
    return options;
}
exports.changeOptions = changeOptions;
