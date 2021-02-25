"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
async function request(query, req) {
    if (query.toLowerCase().match(/^(what('s|s| is) my (user ?agent|ua)|ua|user ?agent)$/i)) {
        const escapedUA = req.req.headers['user-agent']
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return {
            answer: {
                content: `Your user agent is <b>${escapedUA}</b>`,
                template: 'html'
            }
        };
    }
    else
        return {};
}
exports.request = request;
