"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.untrace = exports.trace = void 0;
var traceLevel = 0;
var traceIdentPlaceholder = '\t';
function identLevel() {
    return traceIdentPlaceholder.repeat(traceLevel - 1);
}
function tracePrint(s) {
    console.log("" + identLevel() + s + "\n");
}
function incIdent() {
    traceLevel++;
}
function decIdent() {
    traceLevel--;
}
function trace(msg) {
    incIdent();
    tracePrint("BEGIN " + msg);
    return msg;
}
exports.trace = trace;
function untrace(msg) {
    tracePrint("END " + msg);
    decIdent();
}
exports.untrace = untrace;
