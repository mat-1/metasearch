"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
async function request(query, req) {
    var _a, _b, _c;
    if (query.toLowerCase().match(/^(what('s|s| is) my (user ?agent|ua)|ua|user ?agent)$/i)) {
        const escapedUA = (_c = (_b = (_a = req.req.headers) === null || _a === void 0 ? void 0 : _a['user-agent']) === null || _b === void 0 ? void 0 : _b.replace(/</g, '&lt;')) === null || _c === void 0 ? void 0 : _c.replace(/>/g, '&gt;');
        return {
            answer: {
                content: escapedUA ? `Your user agent is <b>${escapedUA}</b>` : 'You don\'t have a user agent!',
                template: 'html'
            }
        };
    }
    else
        return {};
}
exports.request = request;
