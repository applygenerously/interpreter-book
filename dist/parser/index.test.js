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
    test('parses let statements', function () {
        var e_1, _a;
        var input = "let x = 5;\n    let y = 10;\n    let foobar = 838383;";
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        if (program === null) {
            fail('parseProgram() returned null');
        }
        if (program.statements.length !== 3) {
            fail("program.statements does not contain 3 statements, got " + program.statements.length);
        }
        var expected = [
            'x',
            'y',
            'foobar',
        ];
        try {
            for (var _b = __values(expected.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], e = _d[1];
                var statement = program.statements[i];
                testLetStatement(expect, statement, e);
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
    // TestReturnStatements
    test('parses return statements', function () {
        var e_2, _a;
        var input = "return 5;\n    return 10;\n    return 993322;";
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(3);
        try {
            for (var _b = __values(program.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var statement = _c.value;
                expect(statement).toBeInstanceOf(ast_1.ReturnStatement);
                expect(statement.tokenLiteral()).toBe('return');
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
        testIdentifier(expect, consequence.expression, 'x');
        expect(expression.alternative).toBeFalsy();
    });
    // TestIfElseExpression
    test('parses if else expressions', function () {
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
        expect(expression.alternative.statements.length).toBe(1);
        var alternative = expression.alternative.statements[0];
        expect(alternative).toBeInstanceOf(ast_1.ExpressionStatement);
        testIdentifier(expect, alternative.expression, 'y');
    });
});
function testLetStatement(expect, statement, expected) {
    expect(statement.tokenLiteral()).toEqual('let');
    expect(statement).toBeInstanceOf(ast_1.LetStatement);
    expect(statement.name.value).toBe(expected);
    expect(statement.name.tokenLiteral()).toBe(expected);
}
function testIntegerLiteral(expect, il, value) {
    expect(il).toBeInstanceOf(ast_1.IntegerLiteral);
    expect(il.value).toBe(value);
    expect(il.tokenLiteral()).toBe(value.toString());
}
function testIdentifier(expect, ident, value) {
    expect(ident).toBeInstanceOf(ast_1.Identifier);
    expect(ident.value).toBe(value);
    expect(ident.tokenLiteral()).toBe(value.toString());
}
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
