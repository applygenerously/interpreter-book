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
    test.each([
        ['!5;', '!', 5],
        ['-15', '-', 15],
    ])('parses prefix expressions', function (input, operator, integerValue) {
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
        testIntegerLiteral(expect, expression.right, integerValue);
    });
    test.each([
        ['5 + 5;', 5, '+', 5],
        ['5 - 5;', 5, '-', 5],
        ['5 * 5;', 5, '*', 5],
        ['5 / 5;', 5, '/', 5],
        ['5 > 5;', 5, '>', 5],
        ['5 < 5;', 5, '<', 5],
        ['5 == 5;', 5, '==', 5],
        ['5 != 5;', 5, '!=', 5],
    ])('parses infix expressions', function (input, leftValue, operator, rightValue) {
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        var statement = program.statements[0];
        expect(statement).toBeInstanceOf(ast_1.ExpressionStatement);
        var expression = statement.expression;
        expect(expression).toBeInstanceOf(ast_1.InfixExpression);
        testIntegerLiteral(expect, expression.left, leftValue);
        expect(expression.operator).toBe(operator);
        testIntegerLiteral(expect, expression.right, rightValue);
    });
    test.each([
        ['-a * b', '((-a) * b)'],
        ['!-a', '(!(-a))'],
        ['a + b + c', '((a + b) + c)'],
        ['a + b - c', '((a + b) - c)'],
        ['a * b * c', '((a * b) * c)'],
        ['a * b / c', '((a * b) / c)'],
        ['a + b / c', '(a + (b / c))'],
        ['a + b * c + d / e - f', '(((a + (b * c)) + (d / e)) - f)'],
        // source shows space no space between expected statements?
        // '(3 + 4)((-5) * 5)'
        ['3 + 4; -5 * 5', '(3 + 4) ((-5) * 5)'],
        ['5 > 4 == 3 < 4', '((5 > 4) == (3 < 4))'],
        ['5 < 4 != 3 > 4', '((5 < 4) != (3 > 4))'],
        ['3 + 4 * 5 == 3 * 1 + 4 * 5', '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))'],
    ])('parses operators in correct precedence', function (input, expected) {
        var l = new lexer_1.default(input);
        var p = new _1.default(l);
        var program = p.parseProgram();
        checkParserErrors(p);
        var actual = program.string();
        expect(actual).toBe(expected);
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
