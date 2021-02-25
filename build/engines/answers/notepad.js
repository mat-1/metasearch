"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.request = void 0;
const notepadRegex = /^(python|js|javascript|html|xml|code)? ?(note ?pad|text ?(area|editor)|editor)$/i;
async function request(query) {
    const regexMatch = query.match(notepadRegex);
    if (!regexMatch)
        return {};
    return {
        answer: {
            template: 'notepad'
        }
    };
}
exports.request = request;
exports.weight = 2;
