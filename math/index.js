var Fraction = require('./src/fractions');
var Expression = require('./src/expressions').Expression;
var Equation = require('./src/equations');
var Parser = require('./src/parser');


var parse = function(input){
	var parser = new Parser();
	var result = parser.parse(input);
	return result;
};

var toTex = function(input) {
	if (input instanceof Fraction || input instanceof Expression || input instanceof Equation) {
		return input.toTex();
	} else if (input instanceof Array) {
		return input.map(
			function(e) {
				if (e instanceof Fraction) {
					return e.toTex();
				} else {
					return e.toString();
				}
			}
		).join();
	} else {
		return input.toString();
	}
};

function solve(input) {
	if (!(
		   input.includes('+')
		|| input.includes('-')
		|| input.includes('*')
		|| input.includes('/')
		|| input.includes('^')
		|| input.includes('=')  
		|| input.includes('(')
	))
		return null
	var foundEquations = input.match(/\b([xyz]|[+\-*=^\/\.]|[0-9]| |\(|\)){3,}\b\)?/g)
	if (!foundEquations)
		return null
	var input = foundEquations[0]


	var parser = new Parser();
	try {
		var result = parser.parse(input);
	} catch(err) {
		return null
	}

	if (result === undefined) return null
	if (result.constants === undefined) {
		if (result.lhs === undefined || result.rhs === undefined) return null
		if (result.lhs.terms[0] === undefined && result.rhs.terms[0] === undefined) {
			return deepEquals(result.lhs, result.rhs) ? 'true' : 'false'
		}
		var varname
		if (result.lhs.terms[0] === undefined)
			varname = result.rhs.terms[0].variables[0].variable
		else
			varname = result.lhs.terms[0].variables[0].variable
		try {
			var variableResult = result.solveFor(varname)
		} catch(err) {
			return 'No solution'
		}
		if (variableResult === undefined) return null
		var demoninator = variableResult.denom
		var numerator = variableResult.numer

		return varname + ' = ' + (numerator / demoninator).toString()
	}
	if (result.constants[0] === undefined) return null

	var demoninator = result.constants[0].denom
	var numerator = result.constants[0].numer

	return (numerator / demoninator).toString()
}


module.exports = solve;