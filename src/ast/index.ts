import Token from '../token'

interface ASTNode {
  tokenLiteral: () => Token['literal'];
  string: () => string;
}

interface Statement extends ASTNode {
  statementNode(): unknown;
}

interface Expression extends ASTNode {
  expressionNode(): unknown;
}

export default class Program implements ASTNode {
  statements: Statement[] = []

  tokenLiteral() {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral()
    } else {
      return ''
    }
  }
  string() {
    return this.statements.map(statement => statement.string()).join(' ')
  }
}

class Identifier implements Expression {
  token: Token
  value: string

  constructor(token: Token, value: Token['literal']) {
    this.token = token
    this.value = value
  }

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return this.value
  }
}

class LetStatement implements Statement {
  token: Token
  name?: Identifier
  value?: Expression

  constructor(token: Token) {
    this.token = token
  }

  statementNode() {}
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return `${this.tokenLiteral()} ${this.name?.string()} = ${this.value?.string()};`
  }
} 

class ReturnStatement implements Statement {
  token: Token
  returnValue?: Expression

  constructor(token: Token) {
    this.token = token
  }

  statementNode() {}
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return `${this.tokenLiteral()} ${this.returnValue?.string()};`
  }
}

class ExpressionStatement implements Statement {
  token: Token
  expression: Expression | null = null

  constructor(token: Token) {
    this.token = token
  }

  statementNode() {}
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    if (this.expression) {
      return this.expression.string()
    }
    return ''
  }
}

class IntegerLiteral implements Expression {
  token: Token
  value: number | null = null

  constructor(token: Token) {
    this.token = token
  }

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return this.token.literal
  }
}

class PrefixExpression implements Expression {
  token: Token
  operator: string // '-' or '!'
  right?: Expression

  constructor(token: Token, operator: string) {
    this.token = token
    this.operator = operator
  }

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return `(${this.operator}${this.right.string()})`
  }
}

class InfixExpression implements Expression {
  token: Token
  left: Expression
  operator: string
  right?: Expression

  constructor(token: Token, operator: string, left: Expression) {
    this.token = token
    this.operator = operator
    this.left = left
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return `(${this.left.string()} ${this.operator} ${this.right.string()})`
  }
}

class Boolean implements Expression {
  token: Token
  value: boolean

  constructor(token: Token, value: boolean) {
    this.token = token
    this.value = value
  }
  expressionNode() { }
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return this.token.literal
  }
}

export {
  ASTNode,
  Expression,
  Statement,
  Identifier,
  Program,
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
  Boolean,
}