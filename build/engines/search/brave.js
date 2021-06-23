"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.request = void 0;
const parser_1 = require("../../parser");
async function request(query) {
    return await parser_1.parseResultList('https://search.brave.com/search?q=' + encodeURIComponent(query), {
        resultItemPath: '#results > .fdb',
        titlePath: '.snippet-title',
        hrefPath: '.result-header',
        contentPath: '.snippet-description',
        suggestionPath: '.altered-query > .h6 > a',
    });
}
exports.request = request;
exports.weight = 1.5; // brave's results are really good!
