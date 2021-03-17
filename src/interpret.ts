import { readFileSync } from 'fs'
import Parser from './parser'
import Lexer from './lexer'
import evaluate from './evaluator'
import { Environment } from './object'

function interpret(input: string) {
  const env = new Environment()

  const l = new Lexer(input)
  const p = new Parser(l)

  const program = p.parseProgram()
  if (p.errors.length != 0) {
    printParserErrors(p.errors)
  }

  const evaluated = evaluate(program, env)
  return evaluated.inspect()
}


function printParserErrors(errors: Parser['errors']) {
  for (const error in errors) {
    console.log(`\t${error}\n`)
  }
}

const [path] = process.argv.slice(2)
const input = readFileSync(path, 'utf8')
const interpreted = interpret(input)
console.log(interpreted)
