import * as ast from '../ast'
import Token, { TokenType } from '../token'
import Lexer from '../lexer'

type prefixParseFn = () => ast.Expression
type infixParseFn = (expr: ast.Expression) => ast.Expression

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
  [TokenType.LPAREN, Precedence.CALL],
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
    this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpression)
    this.registerPrefix(TokenType.IF, this.parseIfExpression)
    this.registerPrefix(TokenType.FUNCTION, this.parseFunctionLiteral)
    this.registerPrefix(TokenType.STRING, this.parseStringLiteral)
    
    this.registerInfix(TokenType.EQ, this.parseInfixExpression)
    this.registerInfix(TokenType.NOTEQ, this.parseInfixExpression)
    this.registerInfix(TokenType.LT, this.parseInfixExpression)
    this.registerInfix(TokenType.GT, this.parseInfixExpression)
    this.registerInfix(TokenType.PLUS, this.parseInfixExpression)
    this.registerInfix(TokenType.MINUS, this.parseInfixExpression)
    this.registerInfix(TokenType.SLASH, this.parseInfixExpression)
    this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression)
    this.registerInfix(TokenType.LPAREN, this.parseCallExpression)
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
      // return null
      throw new Error()
    }

    statement.name = new ast.Identifier(this.curToken, this.curToken.literal)
    
    if (!this.expectPeek(TokenType.ASSIGN)) {
      // return null
      throw new Error()
    }

    this.nextToken()

    statement.value = this.parseExpression(Precedence.LOWEST)

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken()
    }

    return statement
  }

  parseReturnStatement() {
    const statement = new ast.ReturnStatement(this.curToken)

    this.nextToken()

    statement.returnValue = this.parseExpression(Precedence.LOWEST)

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
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
      // TODO: remove native error throw so we can view parser errors
      // return null
      throw new Error()
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

  parseGroupedExpression() {
    this.nextToken()
    const expression = this.parseExpression(Precedence.LOWEST)
    if (!this.expectPeek(TokenType.RPAREN)) {
      // syntax error?
      // return null
      throw new Error()
    }
    return expression
  }

  parseIfExpression() {
    const expression = new ast.IfExpression(this.curToken)
    if (!this.expectPeek(TokenType.LPAREN)) {
      // syntax error
      // return null
      throw new Error()
    }
    this.nextToken()
    expression.condition = this.parseExpression(Precedence.LOWEST)
    if (!this.expectPeek(TokenType.RPAREN)) {
      // return null
      throw new Error()
    }
    if (!this.expectPeek(TokenType.LBRACE)) {
      // return null
      throw new Error()
    }
    expression.consequence = this.parseBlockStatement()

    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken()

      if (!this.expectPeek(TokenType.LBRACE)) {
        // return null
        throw new Error()
      }

      expression.alternative = this.parseBlockStatement()
    }

    return expression
  }

  parseBlockStatement() {
    const block = new ast.BlockStatement(this.curToken)
    block.statements = []

    this.nextToken()

    while (!this.curTokenIs(TokenType.RBRACE) && !this.curTokenIs(TokenType.EOF)) {
      const statement = this.parseStatement()
      if (statement) {
        block.statements.push(statement)
      }
      this.nextToken()
    }

    return block
  }

  parseFunctionLiteral() {
    const literal = new ast.FunctionLiteral(this.curToken)

    if (!this.expectPeek(TokenType.LPAREN)) {
      // return null
      throw new Error()
    }

    literal.parameters = this.parseFunctionParameters()

    if (!this.expectPeek(TokenType.LBRACE)) {
      // return null
      throw new Error()
    }

    literal.body = this.parseBlockStatement()

    return literal
  }

  parseFunctionParameters() {
    const identifiers = [] as ast.Identifier[]
    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken()
      return identifiers
    }

    this.nextToken()
    let ident = new ast.Identifier(this.curToken, this.curToken.literal)
    identifiers.push(ident)

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken()
      this.nextToken()
      ident = new ast.Identifier(this.curToken, this.curToken.literal)
      identifiers.push(ident)
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      // return null
      throw new Error()
    }

    return identifiers
  }

  parseCallExpression(fn: ast.Expression) {
    const expression = new ast.CallExpression(this.curToken, fn)
    expression.args = this.parseCallArguments()
    return expression
  }

  parseCallArguments() {
    const args = [] as ast.Expression[]
    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken()
      return args
    }

    this.nextToken()
    // first arg, if only one arg
    args.push(this.parseExpression(Precedence.LOWEST))

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken()
      this.nextToken()
      args.push(this.parseExpression(Precedence.LOWEST))
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      // return null
      throw new Error()
    }

    return args
  }

  parseStringLiteral() {
    return new ast.StringLiteral(this.curToken, this.curToken.literal)
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
    // throw new Error(msg)
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
