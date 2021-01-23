"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var token_1 = require("../token");
var Lexer = /** @class */ (function () {
    function Lexer(input) {
        /**
         * Current position in input (points to current char)
         */
        this.position = 0;
        /**
         * Current reading position in input (after current char)
         */
        this.readPosition = 0;
        /**
         * Char under examination
         */
        this.ch = '';
        this.input = input;
        this.readChar();
    }
    /**
     * Gives us the next character and advances our position in the input string
     */
    Lexer.prototype.readChar = function () {
        // if we are at end of input, set ch to 0, signifying end of input
        if (this.readPosition >= this.input.length) {
            this.ch = 0;
        }
        else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    };
    /**
     * Look ahead in input by one char, but
     * do not increment position or readPosition
     */
    Lexer.prototype.peekChar = function () {
        if (this.readPosition >= this.input.length) {
            return 0;
        }
        else {
            return this.input[this.readPosition];
        }
    };
    Lexer.prototype.readIdentifier = function () {
        var start = this.position;
        while (isLetter(this.ch) && this.readPosition <= this.input.length) {
            this.readChar();
        }
        return this.input.slice(start, this.position);
    };
    Lexer.prototype.readNumber = function () {
        var start = this.position;
        while (isDigit(this.ch) && this.readPosition <= this.input.length) {
            this.readChar();
        }
        return this.input.slice(start, this.position);
    };
    Lexer.prototype.skipWhitespace = function () {
        while (/\s/.test(this.ch)) {
            this.readChar();
        }
    };
    Lexer.prototype.nextToken = function () {
        var tok;
        this.skipWhitespace();
        switch (this.ch) {
            case '=':
                if (this.peekChar() === '=') {
                    var ch = this.ch;
                    this.readChar();
                    var literal = ch.concat(this.ch);
                    tok = new token_1.Token(token_1.TokenType.EQ, literal);
                }
                else {
                    tok = new token_1.Token(token_1.TokenType.ASSIGN, this.ch);
                }
                break;
            case '+':
                tok = new token_1.Token(token_1.TokenType.PLUS, this.ch);
                break;
            case '-':
                tok = new token_1.Token(token_1.TokenType.MINUS, this.ch);
                break;
            case '!':
                if (this.peekChar() === '=') {
                    var ch = this.ch;
                    this.readChar();
                    var literal = ch.concat(this.ch);
                    tok = new token_1.Token(token_1.TokenType.NOTEQ, literal);
                }
                else {
                    tok = new token_1.Token(token_1.TokenType.BANG, this.ch);
                }
                break;
            case '*':
                tok = new token_1.Token(token_1.TokenType.ASTERISK, this.ch);
                break;
            case '/':
                tok = new token_1.Token(token_1.TokenType.SLASH, this.ch);
                break;
            case '<':
                tok = new token_1.Token(token_1.TokenType.LT, this.ch);
                break;
            case '>':
                tok = new token_1.Token(token_1.TokenType.GT, this.ch);
                break;
            case ';':
                tok = new token_1.Token(token_1.TokenType.SEMICOLON, this.ch);
                break;
            case '(':
                tok = new token_1.Token(token_1.TokenType.LPAREN, this.ch);
                break;
            case ')':
                tok = new token_1.Token(token_1.TokenType.RPAREN, this.ch);
                break;
            case ',':
                tok = new token_1.Token(token_1.TokenType.COMMA, this.ch);
                break;
            case '{':
                tok = new token_1.Token(token_1.TokenType.LBRACE, this.ch);
                break;
            case '}':
                tok = new token_1.Token(token_1.TokenType.RBRACE, this.ch);
                break;
            case 0:
                tok = new token_1.Token(token_1.TokenType.EOF, '');
                break;
            default:
                if (isLetter(this.ch)) {
                    var literal = this.readIdentifier();
                    var type = token_1.lookupIdent(literal);
                    tok = new token_1.Token(type, literal);
                    return tok;
                }
                else if (isDigit(this.ch)) {
                    var literal = this.readNumber();
                    tok = new token_1.Token(token_1.TokenType.INT, literal);
                    return tok;
                }
                else {
                    tok = new token_1.Token(token_1.TokenType.ILLEGAL, this.ch);
                }
        }
        this.readChar();
        return tok;
    };
    return Lexer;
}());
exports.default = Lexer;
function isLetter(ch) {
    return /[a-zA-Z]/.test(ch);
}
function isDigit(ch) {
    return /\d/.test(ch);
}
