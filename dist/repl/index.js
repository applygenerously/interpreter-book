"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline_1 = __importDefault(require("readline"));
var parser_1 = __importDefault(require("../parser"));
var lexer_1 = __importDefault(require("../lexer"));
function repl() {
    var rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>> '
    });
    rl.prompt();
    rl.on('line', function (input) {
        var l = new lexer_1.default(input);
        var p = new parser_1.default(l);
        var program = p.parseProgram();
        if (p.errors.length != 0) {
            printParserErrors(p.errors);
        }
        console.log(program.string());
        rl.prompt();
    }).on('close', function () {
        console.log('see ya later!');
        process.exit(0);
    });
}
exports.default = repl;
function printParserErrors(errors) {
    for (var error in errors) {
        console.log("\t" + error + "\n");
    }
}
