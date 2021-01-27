"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lexer_1 = __importDefault(require("../lexer"));
var ast_1 = require("../ast");
var _1 = __importDefault(require("./"));
describe('parser', function () {
    // TestLetStatements
    test.each([
        ['let x = 5;', 'x', 5],
        ['let y = true;', 'y', true],
        ['let foobar = y;', 'foobar', 'y']
    ])('parses let statements', function (input, expectedIdent, expectedVal) {
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        testLetStatement(expect, statement, expectedIdent);
        testLiteralExpression(expect, statement.value, expectedVal);
    });
    // TestReturnStatements
    test.each([
        ['return 5;', 5],
        ['return true;', true],
        ['return foobar;', 'foobar'],
    ])('parses return statements', function (input, expected) {
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        expect(statement).toBeInstanceOf(ast_1.ReturnStatement);
        expect(statement.tokenLiteral()).toBe('return');
        testLiteralExpression(expect, statement.returnValue, expected);
    });
    // TestIdentifierExpressions
    test('parses identifier expressions', function () {
        var input = 'foobar;';
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        expect(statement).toBeInstanceOf(ast_1.ExpressionStatement);
        var identifier = statement.expression;
        expect(identifier).toBeInstanceOf(ast_1.Identifier);
        expect(identifier.value).toBe('foobar');
        expect(identifier === null || identifier === void 0 ? void 0 : identifier.tokenLiteral()).toBe('foobar');
    });
    // TestIntegerLiteralExpressions
    test('parses integer literal expressions', function () {
        var input = '5;';
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        expect(statement).toBeInstanceOf(ast_1.ExpressionStatement);
        var literal = statement.expression;
        expect(literal).toBeInstanceOf(ast_1.IntegerLiteral);
        expect(literal.value).toBe(5);
        expect(literal.tokenLiteral()).toBe('5');
    });
    // TestParsingPrefixExpressions
    test.each([
        ['!5;', '!', 5],
        ['-15', '-', 15],
        ['!true', '!', true],
        ['!false', '!', false],
    ])('parses prefix expressions', function (input, operator, value) {
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        expect(statement).toBeInstanceOf(ast_1.ExpressionStatement);
        var expression = statement.expression;
        expect(expression).toBeInstanceOf(ast_1.PrefixExpression);
        expect(expression.operator).toBe(operator);
        testLiteralExpression(expect, expression.right, value);
    });
    // TestParsingInfixExpressions
    test.each([
        ['5 + 5;', 5, '+', 5],
        ['5 - 5;', 5, '-', 5],
        ['5 * 5;', 5, '*', 5],
        ['5 / 5;', 5, '/', 5],
        ['5 > 5;', 5, '>', 5],
        ['5 < 5;', 5, '<', 5],
        ['5 == 5;', 5, '==', 5],
        ['5 != 5;', 5, '!=', 5],
        ['true == true', true, '==', true],
        ['true != false', true, '!=', false],
        ['false == false', false, '==', false],
    ])('parses infix expressions', function (input, leftValue, operator, rightValue) {
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        testInfixExpression(expect, statement.expression, leftValue, operator, rightValue);
    });
    // TestOperatorPrecedenceParsing
    test.each([
        ['-a * b', '((-a) * b)'],
        ['!-a', '(!(-a))'],
        ['a + b + c', '((a + b) + c)'],
        ['a + b - c', '((a + b) - c)'],
        ['a * b * c', '((a * b) * c)'],
        ['a * b / c', '((a * b) / c)'],
        ['a + b / c', '(a + (b / c))'],
        ['a + b * c + d / e - f', '(((a + (b * c)) + (d / e)) - f)'],
        // source shows no space between expected statements?
        // '(3 + 4)((-5) * 5)'
        ['3 + 4; -5 * 5', '(3 + 4) ((-5) * 5)'],
        ['5 > 4 == 3 < 4', '((5 > 4) == (3 < 4))'],
        ['5 < 4 != 3 > 4', '((5 < 4) != (3 > 4))'],
        ['3 + 4 * 5 == 3 * 1 + 4 * 5', '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))'],
        ['true', 'true'],
        ['false', 'false'],
        ['3 > 5 == false', '((3 > 5) == false)'],
        ['3 < 5 == true', '((3 < 5) == true)'],
        ['1 + (2 + 3) + 4', '((1 + (2 + 3)) + 4)'],
        ['(5 + 5) * 2', '((5 + 5) * 2)'],
        ['2 / (5 + 5)', '(2 / (5 + 5))'],
        ['-(5 + 5)', '(-(5 + 5))'],
        ['!(true == true)', '(!(true == true))'],
        ['a + add(b * c) + d', '((a + add((b * c))) + d)'],
        ['add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))', 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))'],
        ['add(a + b + c * d / f + g)', 'add((((a + b) + ((c * d) / f)) + g))'],
    ])('parses operators in correct precedence', function (input, expected) {
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        var actual = program.string();
        expect(actual).toBe(expected);
    });
    // TestBooleanExpression
    test.each([
        ['true', true],
        ['false', false],
    ])('parses boolean expressions', function (input, expected) {
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        // @ts-ignore
        var expression = program.statements[0].expression;
        expect(expression).toBeInstanceOf(ast_1.Boolean);
        expect(expression.value).toBe(expected);
    });
    // TestIfExpression
    test('parses if expressions', function () {
        var input = 'if (x < y) { x }';
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        expect(statement).toBeInstanceOf(ast_1.ExpressionStatement);
        var expression = statement.expression;
        expect(expression).toBeInstanceOf(ast_1.IfExpression);
        testInfixExpression(expect, expression.condition, 'x', '<', 'y');
        expect(expression.consequence.statements.length).toBe(1);
        var consequence = expression.consequence.statements[0];
        expect(consequence).toBeInstanceOf(ast_1.ExpressionStatement);
        // @ts-ignore
        testIdentifier(expect, consequence.expression, 'x');
        expect(expression.alternative).toBeFalsy();
    });
    // TestIfElseExpression
    test('parses if else expressions', function () {
        var _a, _b;
        var input = 'if (x < y) { x } else { y }';
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        expect(statement).toBeInstanceOf(ast_1.ExpressionStatement);
        var expression = statement.expression;
        expect(expression).toBeInstanceOf(ast_1.IfExpression);
        testInfixExpression(expect, expression.condition, 'x', '<', 'y');
        expect(expression.consequence.statements.length).toBe(1);
        var consequence = expression.consequence.statements[0];
        expect(consequence).toBeInstanceOf(ast_1.ExpressionStatement);
        testIdentifier(expect, consequence.expression, 'x');
        expect((_a = expression.alternative) === null || _a === void 0 ? void 0 : _a.statements.length).toBe(1);
        var alternative = (_b = expression.alternative) === null || _b === void 0 ? void 0 : _b.statements[0];
        expect(alternative).toBeInstanceOf(ast_1.ExpressionStatement);
        // @ts-ignore
        testIdentifier(expect, alternative === null || alternative === void 0 ? void 0 : alternative.expression, 'y');
    });
    // TestFunctionLiteralParsing
    test('parses function literals', function () {
        var input = 'fn(x, y) { x + y }';
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        expect(statement).toBeInstanceOf(ast_1.ExpressionStatement);
        // @ts-ignore
        var fn = statement.expression;
        expect(fn).toBeInstanceOf(ast_1.FunctionLiteral);
        expect(fn.parameters.length).toBe(2);
        testLiteralExpression(expect, fn.parameters[0], 'x');
        testLiteralExpression(expect, fn.parameters[1], 'y');
        expect(fn.body.statements.length).toBe(1);
        var bodyStatement = fn.body.statements[0];
        expect(bodyStatement).toBeInstanceOf(ast_1.ExpressionStatement);
        testInfixExpression(expect, bodyStatement.expression, 'x', '+', 'y');
    });
    // TestFunctionParameterParsing
    test.each([
        ['fn() {}', []],
        ['fn(x) {}', ['x']],
        ['fn(x, y, z) {}', ['x', 'y', 'z']],
    ])('parses function literal parameters', function (input, expected) {
        var e_1, _a;
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        // @ts-ignore
        var fn = program.statements[0].expression;
        expect(fn.parameters.length).toBe(expected.length);
        try {
            for (var _b = __values(expected.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], expectedParam = _d[1];
                testLiteralExpression(expect, fn.parameters[i], expectedParam);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
    // TestCallExpressionParsing
    test('parses call expressions', function () {
        var input = 'add(1, 2 * 3, 4 + 5);';
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        expect(statement).toBeInstanceOf(ast_1.ExpressionStatement);
        // @ts-ignore
        var expression = statement.expression;
        expect(expression).toBeInstanceOf(ast_1.CallExpression);
        testIdentifier(expect, expression.fn, 'add');
        expect(expression.args.length).toBe(3);
        testLiteralExpression(expect, expression.args[0], 1);
        testInfixExpression(expect, expression.args[1], 2, '*', 3);
        testInfixExpression(expect, expression.args[2], 4, '+', 5);
    });
    // TestCallExpressionParameterParsing
    test.each([
        ['add();', 'add', []],
        ['add(1);', 'add', ['1']],
        ['add(1, 2 * 3, 4 + 5);', 'add', ['1', '(2 * 3)', '(4 + 5)']],
    ])('parses call expression parameters', function (input, expectedIdent, expectedArgs) {
        var e_2, _a;
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        // @ts-ignore
        var expression = program.statements[0].expression;
        expect(expression).toBeInstanceOf(ast_1.CallExpression);
        testIdentifier(expect, expression.fn, expectedIdent);
        expect(expression.args.length).toBe(expectedArgs.length);
        try {
            for (var _b = __values(expectedArgs.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], arg = _d[1];
                expect(expression.args[i].string()).toBe(arg);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    });
});
// function testLetStatement(expect: jest.Expect, statement: LetStatement, expected: string) {
function testLetStatement(expect, statement, expected) {
    expect(statement.tokenLiteral()).toEqual('let');
    expect(statement).toBeInstanceOf(ast_1.LetStatement);
    expect(statement.name.value).toBe(expected);
    expect(statement.name.tokenLiteral()).toBe(expected);
}
// function testIntegerLiteral(expect: jest.Expect, il: IntegerLiteral, value: number) {
function testIntegerLiteral(expect, il, value) {
    expect(il).toBeInstanceOf(ast_1.IntegerLiteral);
    expect(il.value).toBe(value);
    expect(il.tokenLiteral()).toBe(value.toString());
}
// function testIdentifier(expect: jest.Expect, ident: Identifier, value: string) {
function testIdentifier(expect, ident, value) {
    expect(ident).toBeInstanceOf(ast_1.Identifier);
    expect(ident.value).toBe(value);
    expect(ident.tokenLiteral()).toBe(value.toString());
}
// function testBooleanLiteral(expect: jest.Expect, bool: Boolean, value: boolean) {
function testBooleanLiteral(expect, bool, value) {
    expect(bool).toBeInstanceOf(ast_1.Boolean);
    expect(bool.value).toBe(value);
    expect(bool.tokenLiteral()).toBe(value.toString());
}
function testLiteralExpression(expect, exp, expected) {
    var type = typeof expected;
    switch (type) {
        case 'number':
            return testIntegerLiteral(expect, exp, expected);
        case 'string':
            return testIdentifier(expect, exp, expected);
        case 'boolean':
            return testBooleanLiteral(expect, exp, expected);
        default:
            throw new Error("type of exp not handled. got " + exp.constructor.name);
    }
}
function testInfixExpression(expect, exp, left, operator, right) {
    expect(exp).toBeInstanceOf(ast_1.InfixExpression);
    testLiteralExpression(expect, exp.left, left);
    expect(exp.operator).toBe(operator);
    testLiteralExpression(expect, exp.right, right);
}
function checkParserErrors(p) {
    var e_3, _a;
    var errors = p.errors;
    if (errors.length === 0) {
        return;
    }
    try {
        for (var errors_1 = __values(errors), errors_1_1 = errors_1.next(); !errors_1_1.done; errors_1_1 = errors_1.next()) {
            var error = errors_1_1.value;
            console.error("Parser had error: " + error);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (errors_1_1 && !errors_1_1.done && (_a = errors_1.return)) _a.call(errors_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    fail("Parser had " + errors.length + " errors");
}
