"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const encodeDecodeRegex = /(?:hex(?:adecimal)?|base ?16) ?(encode|decode|)(?:\s+)(.+)/i;
const toFromRegex = /(.+) (to|from) (?:hex(?:adecimal)?|base ?16)/i;
function hexEncode(string) {
    try {
        return Buffer.from(string).toString('hex');
    }
    catch {
        return null;
    }
}
function hexDecode(string) {
    try {
        let decoded = Buffer.from(string, 'hex').toString('utf8');
        if (decoded.includes('�'))
            return null;
        else
            return decoded;
    }
    catch {
        return null;
    }
}
function match(query) {
    const encodeDecodeRegexMatch = query.match(encodeDecodeRegex);
    if (!encodeDecodeRegexMatch) {
        const toFromRegexMatch = query.match(toFromRegex);
        if (!toFromRegexMatch)
            return {};
        return {
            intent: toFromRegexMatch[2].trim().toLowerCase() === 'to' ? 'encode' : 'decode',
            string: toFromRegexMatch[1].trim()
        };
    }
    return {
        intent: encodeDecodeRegexMatch[1].trim().toLowerCase(),
        string: encodeDecodeRegexMatch[2].trim()
    };
}
async function request(query) {
    const matchResponse = match(query);
    if (!('intent' in matchResponse))
        return {};
    const { intent, string } = matchResponse;
    let encoded = null;
    let decoded = null;
    if (intent == 'encode') {
        encoded = hexEncode(string);
    }
    else if (intent == 'decode') {
        decoded = hexDecode(string);
    }
    else {
        encoded = hexEncode(string);
        decoded = hexDecode(string);
    }
    if (!encoded && !decoded)
        return {};
    let title;
    let answer;
    if (encoded && decoded) {
        title = 'hex encode & decode';
        answer = `${encoded}\n\n${decoded}`;
    }
    else if (encoded) {
        title = 'hex encode';
        answer = encoded;
    }
    else if (decoded) {
        title = 'hex decode';
        answer = decoded;
    }
    return {
        answer: {
            title: title,
            content: answer,
        }
    };
}
exports.request = request;
