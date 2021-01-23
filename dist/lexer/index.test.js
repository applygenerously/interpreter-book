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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var token_1 = require("../token");
var _1 = __importDefault(require("./"));
describe('lexer', function () {
    test('lexes input into tokens', function () {
        var e_1, _a;
        var input = "let five = 5;\n    \n    let ten = 10;\n\n    let add = fn(x, y) {\n      x + y;\n    };\n\n    let result = add(five, ten);\n    \n    !-/*5;\n    5 < 10 > 5;\n    \n    if (5 < 10) {\n      return true;\n    } else {\n      return false; \n    }\n    \n    10 == 10\n    10 != 9";
        var expected = [
            { type: token_1.TokenType.LET, literal: 'let' },
            { type: token_1.TokenType.IDENT, literal: 'five' },
            { type: token_1.TokenType.ASSIGN, literal: '=' },
            { type: token_1.TokenType.INT, literal: '5' },
            { type: token_1.TokenType.SEMICOLON, literal: ';' },
            { type: token_1.TokenType.LET, literal: 'let' },
            { type: token_1.TokenType.IDENT, literal: 'ten' },
            { type: token_1.TokenType.ASSIGN, literal: '=' },
            { type: token_1.TokenType.INT, literal: '10' },
            { type: token_1.TokenType.SEMICOLON, literal: ';' },
            { type: token_1.TokenType.LET, literal: 'let' },
            { type: token_1.TokenType.IDENT, literal: 'add' },
            { type: token_1.TokenType.ASSIGN, literal: '=' },
            { type: token_1.TokenType.FUNCTION, literal: 'fn' },
            { type: token_1.TokenType.LPAREN, literal: '(' },
            { type: token_1.TokenType.IDENT, literal: 'x' },
            { type: token_1.TokenType.COMMA, literal: ',' },
            { type: token_1.TokenType.IDENT, literal: 'y' },
            { type: token_1.TokenType.RPAREN, literal: ')' },
            { type: token_1.TokenType.LBRACE, literal: '{' },
            { type: token_1.TokenType.IDENT, literal: 'x' },
            { type: token_1.TokenType.PLUS, literal: '+' },
            { type: token_1.TokenType.IDENT, literal: 'y' },
            { type: token_1.TokenType.SEMICOLON, literal: ';' },
            { type: token_1.TokenType.RBRACE, literal: '}' },
            { type: token_1.TokenType.SEMICOLON, literal: ';' },
            { type: token_1.TokenType.LET, literal: 'let' },
            { type: token_1.TokenType.IDENT, literal: 'result' },
            { type: token_1.TokenType.ASSIGN, literal: '=' },
            { type: token_1.TokenType.IDENT, literal: 'add' },
            { type: token_1.TokenType.LPAREN, literal: '(' },
            { type: token_1.TokenType.IDENT, literal: 'five' },
            { type: token_1.TokenType.COMMA, literal: ',' },
            { type: token_1.TokenType.IDENT, literal: 'ten' },
            { type: token_1.TokenType.RPAREN, literal: ')' },
            { type: token_1.TokenType.SEMICOLON, literal: ';' },
            { type: token_1.TokenType.BANG, literal: '!' },
            { type: token_1.TokenType.MINUS, literal: '-' },
            { type: token_1.TokenType.SLASH, literal: '/' },
            { type: token_1.TokenType.ASTERISK, literal: '*' },
            { type: token_1.TokenType.INT, literal: '5' },
            { type: token_1.TokenType.SEMICOLON, literal: ';' },
            { type: token_1.TokenType.INT, literal: '5' },
            { type: token_1.TokenType.LT, literal: '<' },
            { type: token_1.TokenType.INT, literal: '10' },
            { type: token_1.TokenType.GT, literal: '>' },
            { type: token_1.TokenType.INT, literal: '5' },
            { type: token_1.TokenType.SEMICOLON, literal: ';' },
            new token_1.Token(token_1.TokenType.IF, 'if'),
            new token_1.Token(token_1.TokenType.LPAREN, '('),
            new token_1.Token(token_1.TokenType.INT, '5'),
            new token_1.Token(token_1.TokenType.LT, '<'),
            new token_1.Token(token_1.TokenType.INT, '10'),
            new token_1.Token(token_1.TokenType.RPAREN, ')'),
            new token_1.Token(token_1.TokenType.LBRACE, '{'),
            new token_1.Token(token_1.TokenType.RETURN, 'return'),
            new token_1.Token(token_1.TokenType.TRUE, 'true'),
            new token_1.Token(token_1.TokenType.SEMICOLON, ';'),
            new token_1.Token(token_1.TokenType.RBRACE, '}'),
            new token_1.Token(token_1.TokenType.ELSE, 'else'),
            new token_1.Token(token_1.TokenType.LBRACE, '{'),
            new token_1.Token(token_1.TokenType.RETURN, 'return'),
            new token_1.Token(token_1.TokenType.FALSE, 'false'),
            new token_1.Token(token_1.TokenType.SEMICOLON, ';'),
            new token_1.Token(token_1.TokenType.RBRACE, '}'),
            new token_1.Token(token_1.TokenType.INT, '10'),
            new token_1.Token(token_1.TokenType.EQ, '=='),
            new token_1.Token(token_1.TokenType.INT, '10'),
            new token_1.Token(token_1.TokenType.INT, '10'),
            new token_1.Token(token_1.TokenType.NOTEQ, '!='),
            new token_1.Token(token_1.TokenType.INT, '9'),
            { type: token_1.TokenType.EOF, literal: '' },
        ];
        var l = new _1.default(input);
        try {
            for (var expected_1 = __values(expected), expected_1_1 = expected_1.next(); !expected_1_1.done; expected_1_1 = expected_1.next()) {
                var e = expected_1_1.value;
                var tok = l.nextToken();
                expect(tok).toEqual(e);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (expected_1_1 && !expected_1_1.done && (_a = expected_1.return)) _a.call(expected_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
});
