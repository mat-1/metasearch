"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.request = void 0;
// searching "metasearch" will show metasearch as the top result
async function request(query) {
    if (query.toLowerCase() === 'metasearch')
        return {
            results: [{
                    title: 'Metasearch',
                    position: 1,
                    content: 'The best (meta)search engine',
                    url: 'https://s.matdoes.dev',
                }]
        };
    else
        return {};
}
exports.request = request;
exports.weight = 100;
