"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = __importDefault(require("./src/parser"));
function solve(input) {
    var foundEquations = input.match(/^([xyz]|[+\-*=^\/\.]|[0-9]+| |\(|\)){3,}\b\)?$/g);
    if (!foundEquations)
        return null;
    var input = foundEquations[0];
    var parser = new parser_1.default();
    try {
        var result = parser.parse(input);
    }
    catch (err) {
        return null;
    }
    if (result === undefined)
        return null;
    if (result.constants === undefined) {
        if (result.lhs === undefined || result.rhs === undefined)
            return null;
        var varname;
        if (result.lhs.terms[0] === undefined)
            varname = result.rhs.terms[0].variables[0].variable;
        else
            varname = result.lhs.terms[0].variables[0].variable;
        try {
            var variableResult = result.solveFor(varname);
        }
        catch (err) {
            return 'No solution';
        }
        if (variableResult === undefined)
            return null;
        var demoninator = variableResult.denom;
        var numerator = variableResult.numer;
        return varname + ' = ' + (numerator / demoninator).toString();
    }
    if (result.constants[0] === undefined)
        return null;
    var demoninator = result.constants[0].denom;
    var numerator = result.constants[0].numer;
    return (numerator / demoninator).toString();
}
exports.default = solve;
