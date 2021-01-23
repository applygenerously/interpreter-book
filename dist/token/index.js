"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.TokenType = exports.lookupIdent = void 0;
var TokenType;
(function (TokenType) {
    // Token type we don't recognize
    TokenType["ILLEGAL"] = "ILLEGAL";
    // End of file
    TokenType["EOF"] = "EOF";
    // Indentifiers and literals
    TokenType["IDENT"] = "IDENT";
    TokenType["INT"] = "INT";
    // Operators
    TokenType["ASSIGN"] = "=";
    TokenType["PLUS"] = "+";
    TokenType["MINUS"] = "-";
    TokenType["BANG"] = "!";
    TokenType["ASTERISK"] = "*";
    TokenType["SLASH"] = "/";
    TokenType["LT"] = "<";
    TokenType["GT"] = ">";
    TokenType["EQ"] = "==";
    TokenType["NOTEQ"] = "!=";
    // Delimiters
    TokenType["COMMA"] = ",";
    TokenType["SEMICOLON"] = ";";
    TokenType["LPAREN"] = "(";
    TokenType["RPAREN"] = ")";
    TokenType["LBRACE"] = "{";
    TokenType["RBRACE"] = "}";
    // Keywords
    TokenType["FUNCTION"] = "FUNCTION";
    TokenType["LET"] = "LET";
    TokenType["TRUE"] = "TRUE";
    TokenType["FALSE"] = "FALSE";
    TokenType["IF"] = "IF";
    TokenType["ELSE"] = "ELSE";
    TokenType["RETURN"] = "RETURN";
})(TokenType || (TokenType = {}));
exports.TokenType = TokenType;
var keywords = new Map([
    ['fn', TokenType.FUNCTION],
    ['let', TokenType.LET],
    ['true', TokenType.TRUE],
    ['false', TokenType.FALSE],
    ['if', TokenType.IF],
    ['else', TokenType.ELSE],
    ['return', TokenType.RETURN],
]);
function lookupIdent(ident) {
    if (keywords.has(ident)) {
        return keywords.get(ident);
    }
    return TokenType.IDENT;
}
exports.lookupIdent = lookupIdent;
var Token = /** @class */ (function () {
    function Token(type, literal) {
        this.type = type;
        this.literal = literal;
    }
    return Token;
}());
exports.Token = Token;
exports.default = Token;
