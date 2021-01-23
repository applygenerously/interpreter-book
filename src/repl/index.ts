import readline from 'readline'
import Lexer from '../lexer'
import { TokenType } from '../token'

export default function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>> '
  })
  
  rl.prompt()
  
  rl.on('line', (input: string) => {
    const l = new Lexer(input)
    let tok
    while (tok?.type !== TokenType.EOF) {
      tok = l.nextToken()
      console.log(tok)
    }
  
    rl.prompt()
  }).on('close', () => {
    console.log('see ya later!')
    process.exit(0)
  })
}
