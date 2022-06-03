"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.request = void 0;
const parser_1 = require("../../parser");
async function request(query) {
    return await (0, parser_1.parseResultList)('https://www.bing.com/search?q=' + encodeURIComponent(query), {
        resultItemPath: '#b_results > li.b_algo',
        titlePath: '.b_algo > h2 > a',
        hrefPath: 'cite',
        contentPath: '.b_caption > p',
        suggestionPath: 'li.b_ans > #sp_requery > a[href] > strong',
    });
}
exports.request = request;
exports.weight = 1.0;
