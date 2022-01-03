"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.autoComplete = exports.request = void 0;
const math_1 = __importDefault(require("../../math"));
async function request(query) {
    const answer = (0, math_1.default)(query);
    if (answer && answer != query)
        return {
            answer: {
                content: answer
            }
        };
    else
        return {};
}
exports.request = request;
async function autoComplete(query) {
    const answer = (0, math_1.default)(query);
    if (answer)
        return ['= ' + answer];
    else
        return [];
}
exports.autoComplete = autoComplete;
exports.weight = 1.1;
