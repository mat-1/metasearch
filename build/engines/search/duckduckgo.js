"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.request = void 0;
const parser_1 = require("../../parser");
// this is duckduckgo html and not normal duckduckgo since normal duckduckgo is way too slow, but html duckduckgo provides worse results
async function request(query) {
    return await parser_1.parseResultList('https://html.duckduckgo.com/html?q=' + encodeURIComponent(query), {
        resultItemPath: '.result',
        titlePath: 'h2',
        hrefPath: 'h2 > a',
        contentPath: '.result__snippet',
        // this is disabled because the answers are low quality
        // suggestionPath: '#did_you_mean > a:first-of-type'
    });
}
exports.request = request;
// weight is low because of the bad results
exports.weight = .4;
