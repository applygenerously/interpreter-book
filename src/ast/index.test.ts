import Token, { TokenType } from '../token'
import * as ast from '../ast'

describe('ast', () => {
  test('prints program as string', () => {
    const p = new ast.Program()
    const statement = new ast.LetStatement(new Token(TokenType.LET, 'let'))
    statement.name = new ast.Identifier(new Token(TokenType.IDENT, 'myVar'), 'myVar')
    statement.value = new ast.Identifier(new Token(TokenType.IDENT, 'anotherVar'), 'anotherVar')
    p.statements = [statement]

    const expected = 'let myVar = anotherVar;'
    expect(p.string()).toEqual(expected)
  })
})