"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallExpression = exports.FunctionLiteral = exports.BlockStatement = exports.IfExpression = exports.Boolean = exports.InfixExpression = exports.PrefixExpression = exports.IntegerLiteral = exports.ExpressionStatement = exports.ReturnStatement = exports.LetStatement = exports.Program = exports.Identifier = void 0;
var Program = /** @class */ (function () {
    function Program() {
        this.statements = [];
    }
    Program.prototype.tokenLiteral = function () {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        }
        else {
            return '';
        }
    };
    Program.prototype.string = function () {
        return this.statements.map(function (statement) { return statement.string(); }).join(' ');
    };
    return Program;
}());
exports.Program = Program;
exports.default = Program;
var Identifier = /** @class */ (function () {
    function Identifier(token, value) {
        this.token = token;
        this.value = value;
    }
    Identifier.prototype.expressionNode = function () { };
    Identifier.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    Identifier.prototype.string = function () {
        return this.value;
    };
    return Identifier;
}());
exports.Identifier = Identifier;
var LetStatement = /** @class */ (function () {
    function LetStatement(token) {
        this.token = token;
    }
    LetStatement.prototype.statementNode = function () { };
    LetStatement.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    LetStatement.prototype.string = function () {
        return this.tokenLiteral() + " " + this.name.string() + " = " + this.value.string() + ";";
    };
    return LetStatement;
}());
exports.LetStatement = LetStatement;
var ReturnStatement = /** @class */ (function () {
    function ReturnStatement(token) {
        this.token = token;
    }
    ReturnStatement.prototype.statementNode = function () { };
    ReturnStatement.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    ReturnStatement.prototype.string = function () {
        return this.tokenLiteral() + " " + this.returnValue.string() + ";";
    };
    return ReturnStatement;
}());
exports.ReturnStatement = ReturnStatement;
var ExpressionStatement = /** @class */ (function () {
    function ExpressionStatement(token) {
        this.expression = null;
        this.token = token;
    }
    ExpressionStatement.prototype.statementNode = function () { };
    ExpressionStatement.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    ExpressionStatement.prototype.string = function () {
        if (this.expression) {
            return this.expression.string();
        }
        return '';
    };
    return ExpressionStatement;
}());
exports.ExpressionStatement = ExpressionStatement;
var IntegerLiteral = /** @class */ (function () {
    function IntegerLiteral(token) {
        this.value = null;
        this.token = token;
    }
    IntegerLiteral.prototype.expressionNode = function () { };
    IntegerLiteral.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    IntegerLiteral.prototype.string = function () {
        return this.token.literal;
    };
    return IntegerLiteral;
}());
exports.IntegerLiteral = IntegerLiteral;
var PrefixExpression = /** @class */ (function () {
    function PrefixExpression(token, operator) {
        this.token = token;
        this.operator = operator;
    }
    PrefixExpression.prototype.expressionNode = function () { };
    PrefixExpression.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    PrefixExpression.prototype.string = function () {
        return "(" + this.operator + this.right.string() + ")";
    };
    return PrefixExpression;
}());
exports.PrefixExpression = PrefixExpression;
var InfixExpression = /** @class */ (function () {
    function InfixExpression(token, operator, left) {
        this.token = token;
        this.operator = operator;
        this.left = left;
    }
    InfixExpression.prototype.expressionNode = function () { };
    InfixExpression.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    InfixExpression.prototype.string = function () {
        return "(" + this.left.string() + " " + this.operator + " " + this.right.string() + ")";
    };
    return InfixExpression;
}());
exports.InfixExpression = InfixExpression;
var Boolean = /** @class */ (function () {
    function Boolean(token, value) {
        this.token = token;
        this.value = value;
    }
    Boolean.prototype.expressionNode = function () { };
    Boolean.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    Boolean.prototype.string = function () {
        return this.token.literal;
    };
    return Boolean;
}());
exports.Boolean = Boolean;
var IfExpression = /** @class */ (function () {
    function IfExpression(token) {
        this.token = token;
    }
    IfExpression.prototype.expressionNode = function () { };
    IfExpression.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    IfExpression.prototype.string = function () {
        var _a;
        var literal = 'if' + ((_a = this.condition) === null || _a === void 0 ? void 0 : _a.string()) +
            this.consequence.string() +
            (this.alternative ? "else " + this.alternative.string() : '');
        return literal;
    };
    return IfExpression;
}());
exports.IfExpression = IfExpression;
var BlockStatement = /** @class */ (function () {
    function BlockStatement(token) {
        this.statements = [];
        this.token = token;
    }
    BlockStatement.prototype.statementNode = function () { };
    BlockStatement.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    BlockStatement.prototype.string = function () {
        return this.statements.map(function (s) { return s.string(); }).join('');
    };
    return BlockStatement;
}());
exports.BlockStatement = BlockStatement;
var FunctionLiteral = /** @class */ (function () {
    function FunctionLiteral(token) {
        this.parameters = [];
        // should we use ts non-null assertion here?
        this.body = null;
        this.token = token;
    }
    FunctionLiteral.prototype.expressionNode = function () { };
    FunctionLiteral.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    FunctionLiteral.prototype.string = function () {
        var _a;
        return this.token.literal + "(" + this.parameters.map(function (p) { return p.string(); }).join(', ') + ") " + ((_a = this.body) === null || _a === void 0 ? void 0 : _a.string());
    };
    return FunctionLiteral;
}());
exports.FunctionLiteral = FunctionLiteral;
var CallExpression = /** @class */ (function () {
    function CallExpression(token, fn) {
        this.args = [];
        this.token = token;
        this.fn = fn;
    }
    CallExpression.prototype.expressionNode = function () { };
    CallExpression.prototype.tokenLiteral = function () {
        return this.token.literal;
    };
    CallExpression.prototype.string = function () {
        return this.fn.string() + "(" + this.args.map(function (a) { return a.string(); }).join(', ') + ")";
    };
    return CallExpression;
}());
exports.CallExpression = CallExpression;
