"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeOptions = exports.runPlugin = void 0;
const parser_1 = require("../../parser");
const wikipediaPrefix = 'https://en.wikipedia.org/wiki/';
async function runPlugin({ urlTitle }) {
    const summaryJson = await (0, parser_1.requestJSON)('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts|pageimages&exintro&explaintext&redirects=1&exsentences=2&titles=' + encodeURIComponent(urlTitle));
    const pages = summaryJson.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId == '-1')
        return {};
    const article = pages[pageId];
    if (article.extract.endsWith(':'))
        return {};
    return {
        title: article.title,
        content: article.extract,
        image: article.thumbnail ? article.thumbnail.source : undefined,
        url: 'https://en.wikipedia.org/wiki/' + article.title.replace(' ', '_')
    };
}
exports.runPlugin = runPlugin;
async function changeOptions(options) {
    var _a;
    if (options.answer && options.sidebar)
        // an answer was already returned from somewhere else
        return options;
    for (let resultIndex = 0; resultIndex < Math.max(10, options.results.length); resultIndex++) {
        const result = options.results[resultIndex];
        if ((_a = result === null || result === void 0 ? void 0 : result.url) === null || _a === void 0 ? void 0 : _a.startsWith(wikipediaPrefix)) {
            const wikipediaArticleTitle = result.url.slice(wikipediaPrefix.length);
            options.plugins.wikipedia = {
                urlTitle: wikipediaArticleTitle
            };
            break;
        }
    }
    return options;
}
exports.changeOptions = changeOptions;
