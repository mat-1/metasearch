"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeOptions = exports.runPlugin = void 0;
const parser_1 = require("../../parser");
const stackOverflowHost = 'https://stackoverflow.com';
async function runPlugin({ id }) {
    var _a, _b, _c, _d;
    const originalUrl = `${stackOverflowHost}/questions/${id}`;
    const dom = await (0, parser_1.requestDom)(originalUrl);
    const body = dom('body');
    const answerContainerEl = (0, parser_1.get)(body, 'div.answer.accepted-answer');
    if (answerContainerEl.html() == null)
        // no accepted answer :(
        return false;
    const title = (0, parser_1.extractText)(body, 'h1.fs-headline1 a.question-hyperlink');
    let url = stackOverflowHost + (0, parser_1.extractHref)(body, '.question-hyperlink');
    const answerId = answerContainerEl.attr('data-answerid');
    const answerEl = (0, parser_1.get)(answerContainerEl, 'div.answercell > div.js-post-body');
    url = url + '#' + answerId;
    return {
        html: (_d = (_c = (_b = (_a = answerEl.html()) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.replace(/\n/g, '\\n')) === null || _c === void 0 ? void 0 : _c.replace(/`/g, '\\`')) !== null && _d !== void 0 ? _d : '',
        url: url.replace(/`/g, '\\`'),
        title: title.replace(/`/g, '\\`'),
        originalUrl: originalUrl.replace(/`/g, '\\`')
    };
}
exports.runPlugin = runPlugin;
async function changeOptions(options) {
    if (options.answer && options.sidebar)
        // an answer was already returned from somewhere else
        return options;
    for (let resultIndex = 0; resultIndex < options.results.length; resultIndex++) {
        const result = options.results[resultIndex];
        if (result.url.startsWith(stackOverflowHost + '/questions') && resultIndex <= 4) {
            // +1 to remove the extra slash
            const stackOverflowId = result.url.slice(stackOverflowHost.length + 1).split('/')[1];
            if (!options.plugins.stackoverflow)
                options.plugins.stackoverflow = {
                    id: parseInt(stackOverflowId)
                };
        }
    }
    return options;
}
exports.changeOptions = changeOptions;
