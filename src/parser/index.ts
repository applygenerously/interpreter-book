import * as ast from '../ast'
import Token, { TokenType } from '../token'
import Lexer from '../lexer'

type prefixParseFn = () => ast.Expression | null
type infixParseFn = (expr: ast.Expression) => ast.Expression | null

enum Precedence {
  LOWEST = 0,
  EQUALS, // ==
  LESSGREATER, // < or >
  SUM, // +
  PRODUCT, // *
  PREFIX, // -x or !x
  CALL, // myFunction(x)
}

const precedences = new Map<TokenType, Precedence>([
  [TokenType.EQ, Precedence.EQUALS],
  [TokenType.NOTEQ, Precedence.EQUALS],
  [TokenType.LT, Precedence.LESSGREATER],
  [TokenType.GT, Precedence.LESSGREATER],
  [TokenType.PLUS, Precedence.SUM],
  [TokenType.MINUS, Precedence.SUM],
  [TokenType.SLASH, Precedence.PRODUCT],
  [TokenType.ASTERISK, Precedence.PRODUCT],
])

export default class Parser {
  errors: string[] = []
  l: Lexer
  // we use typescript's non-null assertion here.
  // curToken and peekToken are set in the
  // constructor when nextToken() is called.
  curToken!: Token
  peekToken!: Token
  prefixParseFns = new Map<TokenType, prefixParseFn>()
  infixParseFns = new Map<TokenType, infixParseFn>()

  constructor(l: Lexer) {
    this.l = l

    this.nextToken()
    this.nextToken()

    this.registerPrefix(TokenType.IDENT, this.parseIdentifier)
    this.registerPrefix(TokenType.INT, this.parseIntegerLiteral)
    this.registerPrefix(TokenType.BANG, this.parsePrefixExpression)
    this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression)
    this.registerPrefix(TokenType.TRUE, this.parseBoolean)
    this.registerPrefix(TokenType.FALSE, this.parseBoolean)
    
    this.registerInfix(TokenType.EQ, this.parseInfixExpression)
    this.registerInfix(TokenType.NOTEQ, this.parseInfixExpression)
    this.registerInfix(TokenType.LT, this.parseInfixExpression)
    this.registerInfix(TokenType.GT, this.parseInfixExpression)
    this.registerInfix(TokenType.PLUS, this.parseInfixExpression)
    this.registerInfix(TokenType.MINUS, this.parseInfixExpression)
    this.registerInfix(TokenType.SLASH, this.parseInfixExpression)
    this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression)
  }

  nextToken() {
    this.curToken = this.peekToken
    this.peekToken = this.l.nextToken()
  }

  parseProgram(): ast.Program { 
    const program = new ast.Program()

    while (!this.curTokenIs(TokenType.EOF)) {
      const statement = this.parseStatement()
      if (statement !== null) {
        program.statements.push(statement)
      }
      this.nextToken()
    }

    return program
  }

  parseStatement() {
    switch(this.curToken.type) {
      case (TokenType.LET):
        return this.parseLetStatement()
      case (TokenType.RETURN):
        return this.parseReturnStatement()
      default:
        return this.parseExpressionStatement()
    }
  }

  parseLetStatement() {
    const statement = new ast.LetStatement(this.curToken)
    if (!this.expectPeek(TokenType.IDENT)) {
      return null
    }

    statement.name = new ast.Identifier(this.curToken, this.curToken.literal)
    
    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null
    }

    // TODO: we're skipping the expressions until we encounter a semicolon
    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return statement
  }

  parseReturnStatement() {
    const statement = new ast.ReturnStatement(this.curToken)

    this.nextToken()

    // TODO: we're skipping the expressions until we encounter a semicolon
    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return statement
  }

  parseExpressionStatement() {
    const statement = new ast.ExpressionStatement(this.curToken)
    statement.expression = this.parseExpression(Precedence.LOWEST)
    
    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return statement
  }

  parseExpression(precedence: Precedence) {
    const prefix = this.prefixParseFns.get(this.curToken.type)
    if (prefix === undefined) {
      this.noPrefixParserFnError(this.curToken.type)
      return null
    }

    let leftExp = prefix()

    while (!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infix = this.infixParseFns.get(this.peekToken.type)
      if (infix === undefined) {
        return leftExp
      }

      this.nextToken()
      
      leftExp = infix(leftExp)
    }

    return leftExp
  }

  parsePrefixExpression() {
    const expression = new ast.PrefixExpression(this.curToken, this.curToken.literal)
    this.nextToken()
    expression.right = this.parseExpression(Precedence.PREFIX)
    return expression
  }

  parseInfixExpression(left: ast.Expression) {
    const expression = new ast.InfixExpression(this.curToken, this.curToken.literal, left)
    const precedence = this.curPrecedence()
    this.nextToken()
    expression.right = this.parseExpression(precedence)
    return expression
  }

  parseIdentifier() {
    return new ast.Identifier(this.curToken, this.curToken.literal)
  }

  parseIntegerLiteral() {
    const literal = new ast.IntegerLiteral(this.curToken)
    try {
      const value = parseInt(this.curToken.literal, 10)
      literal.value = value
      return literal
    } catch(e) {
      const message = `Could not parse ${this.curToken.literal} as number.`
      this.errors.push(message)
      throw new Error(message)
    }
  }

  parseBoolean() {
    return new ast.Boolean(this.curToken, this.curTokenIs(TokenType.TRUE))
  }

  curTokenIs(t: TokenType) {
    return this.curToken.type === t
  }

  peekTokenIs(t: TokenType) {
    return this.peekToken.type === t
  }

  peekPrecedence() {
    if (precedences.has(this.peekToken.type)) {
      // typescript doesn't understand maps
      return precedences.get(this.peekToken.type) as Precedence
    }
    return Precedence.LOWEST
  }

  curPrecedence() {
    if (precedences.has(this.curToken.type)) {
      // typescript doesn't understand maps
      return precedences.get(this.curToken.type) as Precedence
    }
    return Precedence.LOWEST
  }

  /**
   * asserts whether next token is of the expected type.
   * if token type is correct, advances the token under inspection
   */
  expectPeek(t: TokenType) {
    if (this.peekTokenIs(t)) {
      this.nextToken()
      return true
    } else {
      this.peekError(t)
      return false
    }
  }

  peekError(t: TokenType) {
    const msg = `Expected next token to be ${t}, got ${this.peekToken.type} instead.`
    this.errors.push(msg)
  }

  registerPrefix(t: TokenType, fn: prefixParseFn) {
    this.prefixParseFns.set(t, fn.bind(this))
  }

  registerInfix(t: TokenType, fn: infixParseFn) {
    this.infixParseFns.set(t, fn.bind(this))
  }

  noPrefixParserFnError(t: TokenType) {
    const msg = `No prefix parse function for ${t} found.`
    this.errors.push(msg)
  }
}
