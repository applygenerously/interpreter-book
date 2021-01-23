"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline_1 = __importDefault(require("readline"));
var lexer_1 = __importDefault(require("../lexer"));
var token_1 = require("../token");
function repl() {
    var rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>> '
    });
    rl.prompt();
    rl.on('line', function (input) {
        var l = new lexer_1.default(input);
        var tok;
        while ((tok === null || tok === void 0 ? void 0 : tok.type) !== token_1.TokenType.EOF) {
            tok = l.nextToken();
            console.log(tok);
        }
        rl.prompt();
    }).on('close', function () {
        console.log('see ya later!');
        process.exit(0);
    });
}
exports.default = repl;
