"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.request = void 0;
const parser_1 = require("../../parser");
async function request(query) {
    return await parser_1.parseResultList('https://html.duckduckgo.com/html?q=' + encodeURIComponent(query), {
        resultItemPath: '.result',
        titlePath: 'h2',
        hrefPath: 'h2 > a',
        contentPath: '.result__snippet',
    });
}
exports.request = request;
exports.weight = 1.01;
