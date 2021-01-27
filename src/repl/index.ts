import readline from 'readline'
import Parser from '../parser'
import Lexer from '../lexer'

export default function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>> '
  })
  
  rl.prompt()
  
  rl.on('line', (input: string) => {
    const l = new Lexer(input)
    const p = new Parser(l)

    const program = p.parseProgram()
    if (p.errors.length != 0) {
      printParserErrors(p.errors)
    }

    console.log(program.string())

    rl.prompt()
  }).on('close', () => {
    console.log('see ya later!')
    process.exit(0)
  })
}

function printParserErrors(errors: Parser['errors']) {
  for (const error in errors) {
    console.log(`\t${error}\n`)
  }
}
