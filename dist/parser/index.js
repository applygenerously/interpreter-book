"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ast = __importStar(require("../ast"));
var token_1 = require("../token");
var Precedence;
(function (Precedence) {
    Precedence[Precedence["LOWEST"] = 0] = "LOWEST";
    Precedence[Precedence["EQUALS"] = 1] = "EQUALS";
    Precedence[Precedence["LESSGREATER"] = 2] = "LESSGREATER";
    Precedence[Precedence["SUM"] = 3] = "SUM";
    Precedence[Precedence["PRODUCT"] = 4] = "PRODUCT";
    Precedence[Precedence["PREFIX"] = 5] = "PREFIX";
    Precedence[Precedence["CALL"] = 6] = "CALL";
})(Precedence || (Precedence = {}));
var precedences = new Map([
    [token_1.TokenType.EQ, Precedence.EQUALS],
    [token_1.TokenType.NOTEQ, Precedence.EQUALS],
    [token_1.TokenType.LT, Precedence.LESSGREATER],
    [token_1.TokenType.GT, Precedence.LESSGREATER],
    [token_1.TokenType.PLUS, Precedence.SUM],
    [token_1.TokenType.MINUS, Precedence.SUM],
    [token_1.TokenType.SLASH, Precedence.PRODUCT],
    [token_1.TokenType.ASTERISK, Precedence.PRODUCT],
    [token_1.TokenType.LPAREN, Precedence.CALL],
]);
var Parser = /** @class */ (function () {
    function Parser(l) {
        this.errors = [];
        this.prefixParseFns = new Map();
        this.infixParseFns = new Map();
        this.l = l;
        this.nextToken();
        this.nextToken();
        this.registerPrefix(token_1.TokenType.IDENT, this.parseIdentifier);
        this.registerPrefix(token_1.TokenType.INT, this.parseIntegerLiteral);
        this.registerPrefix(token_1.TokenType.BANG, this.parsePrefixExpression);
        this.registerPrefix(token_1.TokenType.MINUS, this.parsePrefixExpression);
        this.registerPrefix(token_1.TokenType.TRUE, this.parseBoolean);
        this.registerPrefix(token_1.TokenType.FALSE, this.parseBoolean);
        this.registerPrefix(token_1.TokenType.LPAREN, this.parseGroupedExpression);
        this.registerPrefix(token_1.TokenType.IF, this.parseIfExpression);
        this.registerPrefix(token_1.TokenType.FUNCTION, this.parseFunctionLiteral);
        this.registerInfix(token_1.TokenType.EQ, this.parseInfixExpression);
        this.registerInfix(token_1.TokenType.NOTEQ, this.parseInfixExpression);
        this.registerInfix(token_1.TokenType.LT, this.parseInfixExpression);
        this.registerInfix(token_1.TokenType.GT, this.parseInfixExpression);
        this.registerInfix(token_1.TokenType.PLUS, this.parseInfixExpression);
        this.registerInfix(token_1.TokenType.MINUS, this.parseInfixExpression);
        this.registerInfix(token_1.TokenType.SLASH, this.parseInfixExpression);
        this.registerInfix(token_1.TokenType.ASTERISK, this.parseInfixExpression);
        this.registerInfix(token_1.TokenType.LPAREN, this.parseCallExpression);
    }
    Parser.prototype.nextToken = function () {
        this.curToken = this.peekToken;
        this.peekToken = this.l.nextToken();
    };
    Parser.prototype.parseProgram = function () {
        var program = new ast.Program();
        while (!this.curTokenIs(token_1.TokenType.EOF)) {
            var statement = this.parseStatement();
            if (statement !== null) {
                program.statements.push(statement);
            }
            this.nextToken();
        }
        return program;
    };
    Parser.prototype.parseStatement = function () {
        switch (this.curToken.type) {
            case (token_1.TokenType.LET):
                return this.parseLetStatement();
            case (token_1.TokenType.RETURN):
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    };
    Parser.prototype.parseLetStatement = function () {
        var statement = new ast.LetStatement(this.curToken);
        if (!this.expectPeek(token_1.TokenType.IDENT)) {
            return null;
        }
        statement.name = new ast.Identifier(this.curToken, this.curToken.literal);
        if (!this.expectPeek(token_1.TokenType.ASSIGN)) {
            // return null
            throw new Error();
        }
        this.nextToken();
        statement.value = this.parseExpression(Precedence.LOWEST);
        if (this.peekTokenIs(token_1.TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return statement;
    };
    Parser.prototype.parseReturnStatement = function () {
        var statement = new ast.ReturnStatement(this.curToken);
        this.nextToken();
        statement.returnValue = this.parseExpression(Precedence.LOWEST);
        if (this.peekTokenIs(token_1.TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return statement;
    };
    Parser.prototype.parseExpressionStatement = function () {
        var statement = new ast.ExpressionStatement(this.curToken);
        statement.expression = this.parseExpression(Precedence.LOWEST);
        if (this.peekTokenIs(token_1.TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return statement;
    };
    Parser.prototype.parseExpression = function (precedence) {
        var prefix = this.prefixParseFns.get(this.curToken.type);
        if (prefix === undefined) {
            this.noPrefixParserFnError(this.curToken.type);
            // return null
            throw new Error();
        }
        var leftExp = prefix();
        while (!this.peekTokenIs(token_1.TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
            var infix = this.infixParseFns.get(this.peekToken.type);
            if (infix === undefined) {
                return leftExp;
            }
            this.nextToken();
            leftExp = infix(leftExp);
        }
        return leftExp;
    };
    Parser.prototype.parsePrefixExpression = function () {
        var expression = new ast.PrefixExpression(this.curToken, this.curToken.literal);
        this.nextToken();
        expression.right = this.parseExpression(Precedence.PREFIX);
        return expression;
    };
    Parser.prototype.parseInfixExpression = function (left) {
        var expression = new ast.InfixExpression(this.curToken, this.curToken.literal, left);
        var precedence = this.curPrecedence();
        this.nextToken();
        expression.right = this.parseExpression(precedence);
        return expression;
    };
    Parser.prototype.parseIdentifier = function () {
        return new ast.Identifier(this.curToken, this.curToken.literal);
    };
    Parser.prototype.parseIntegerLiteral = function () {
        var literal = new ast.IntegerLiteral(this.curToken);
        try {
            var value = parseInt(this.curToken.literal, 10);
            literal.value = value;
            return literal;
        }
        catch (e) {
            var message = "Could not parse " + this.curToken.literal + " as number.";
            this.errors.push(message);
            throw new Error(message);
        }
    };
    Parser.prototype.parseBoolean = function () {
        return new ast.Boolean(this.curToken, this.curTokenIs(token_1.TokenType.TRUE));
    };
    Parser.prototype.parseGroupedExpression = function () {
        this.nextToken();
        var expression = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(token_1.TokenType.RPAREN)) {
            // syntax error?
            // return null
            throw new Error();
        }
        return expression;
    };
    Parser.prototype.parseIfExpression = function () {
        var expression = new ast.IfExpression(this.curToken);
        if (!this.expectPeek(token_1.TokenType.LPAREN)) {
            // syntax error
            // return null
            throw new Error();
        }
        this.nextToken();
        expression.condition = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(token_1.TokenType.RPAREN)) {
            // return null
            throw new Error();
        }
        if (!this.expectPeek(token_1.TokenType.LBRACE)) {
            // return null
            throw new Error();
        }
        expression.consequence = this.parseBlockStatement();
        if (this.peekTokenIs(token_1.TokenType.ELSE)) {
            this.nextToken();
            if (!this.expectPeek(token_1.TokenType.LBRACE)) {
                // return null
                throw new Error();
            }
            expression.alternative = this.parseBlockStatement();
        }
        return expression;
    };
    Parser.prototype.parseBlockStatement = function () {
        var block = new ast.BlockStatement(this.curToken);
        block.statements = [];
        this.nextToken();
        while (!this.curTokenIs(token_1.TokenType.RBRACE) && !this.curTokenIs(token_1.TokenType.EOF)) {
            var statement = this.parseStatement();
            if (statement) {
                block.statements.push(statement);
            }
            this.nextToken();
        }
        return block;
    };
    Parser.prototype.parseFunctionLiteral = function () {
        var literal = new ast.FunctionLiteral(this.curToken);
        if (!this.expectPeek(token_1.TokenType.LPAREN)) {
            // return null
            throw new Error();
        }
        literal.parameters = this.parseFunctionParameters();
        if (!this.expectPeek(token_1.TokenType.LBRACE)) {
            // return null
            throw new Error();
        }
        literal.body = this.parseBlockStatement();
        return literal;
    };
    Parser.prototype.parseFunctionParameters = function () {
        var identifiers = [];
        if (this.peekTokenIs(token_1.TokenType.RPAREN)) {
            this.nextToken();
            return identifiers;
        }
        this.nextToken();
        var ident = new ast.Identifier(this.curToken, this.curToken.literal);
        identifiers.push(ident);
        while (this.peekTokenIs(token_1.TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            ident = new ast.Identifier(this.curToken, this.curToken.literal);
            identifiers.push(ident);
        }
        if (!this.expectPeek(token_1.TokenType.RPAREN)) {
            // return null
            throw new Error();
        }
        return identifiers;
    };
    Parser.prototype.parseCallExpression = function (fn) {
        var expression = new ast.CallExpression(this.curToken, fn);
        expression.args = this.parseCallArguments();
        return expression;
    };
    Parser.prototype.parseCallArguments = function () {
        var args = [];
        if (this.peekTokenIs(token_1.TokenType.RPAREN)) {
            this.nextToken();
            return args;
        }
        this.nextToken();
        // first arg, if only one arg
        args.push(this.parseExpression(Precedence.LOWEST));
        while (this.peekTokenIs(token_1.TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            args.push(this.parseExpression(Precedence.LOWEST));
        }
        if (!this.expectPeek(token_1.TokenType.RPAREN)) {
            // return null
            throw new Error();
        }
        return args;
    };
    Parser.prototype.curTokenIs = function (t) {
        return this.curToken.type === t;
    };
    Parser.prototype.peekTokenIs = function (t) {
        return this.peekToken.type === t;
    };
    Parser.prototype.peekPrecedence = function () {
        if (precedences.has(this.peekToken.type)) {
            // typescript doesn't understand maps
            return precedences.get(this.peekToken.type);
        }
        return Precedence.LOWEST;
    };
    Parser.prototype.curPrecedence = function () {
        if (precedences.has(this.curToken.type)) {
            // typescript doesn't understand maps
            return precedences.get(this.curToken.type);
        }
        return Precedence.LOWEST;
    };
    /**
     * asserts whether next token is of the expected type.
     * if token type is correct, advances the token under inspection
     */
    Parser.prototype.expectPeek = function (t) {
        if (this.peekTokenIs(t)) {
            this.nextToken();
            return true;
        }
        else {
            this.peekError(t);
            return false;
        }
    };
    Parser.prototype.peekError = function (t) {
        var msg = "Expected next token to be " + t + ", got " + this.peekToken.type + " instead.";
        this.errors.push(msg);
    };
    Parser.prototype.registerPrefix = function (t, fn) {
        this.prefixParseFns.set(t, fn.bind(this));
    };
    Parser.prototype.registerInfix = function (t, fn) {
        this.infixParseFns.set(t, fn.bind(this));
    };
    Parser.prototype.noPrefixParserFnError = function (t) {
        var msg = "No prefix parse function for " + t + " found.";
        this.errors.push(msg);
    };
    return Parser;
}());
exports.default = Parser;
