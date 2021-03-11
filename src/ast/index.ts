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
  // statements: Statement[] = []
  statements: (LetStatement | ExpressionStatement | ReturnStatement)[] = []

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
  name!: Identifier
  value!: Expression

  constructor(token: Token) {
    this.token = token
  }

  statementNode() {}
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return `${this.tokenLiteral()} ${this.name.string()} = ${this.value.string()};`
  }
} 

class ReturnStatement implements Statement {
  token: Token
  returnValue!: Expression

  constructor(token: Token) {
    this.token = token
  }

  statementNode() {}
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return `${this.tokenLiteral()} ${this.returnValue.string()};`
  }
}

class ExpressionStatement implements Statement {
  token: Token
  // expression: Expression | null = null
  expression!: Expression

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
  // value: number | null = null
  value!: number

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

class StringLiteral implements Expression {
  token: Token
  value: string

  constructor(token: Token, value: string) {
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

class PrefixExpression implements Expression {
  token: Token
  operator: string // '-' or '!'
  right!: Expression

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
  right!: Expression

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

class IfExpression implements Expression {
  token: Token // the 'if' token
  // condition: Expression | null
  condition!: Expression
  consequence!: BlockStatement
  alternative?: BlockStatement

  constructor(
    token: Token,
  ) {
    this.token = token
  }
  expressionNode() { }
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    const literal = 'if' + this.condition?.string() +
      this.consequence.string() +
      (this.alternative ? `else ${this.alternative.string()}` : '')
    return literal
  }
}

class BlockStatement implements Statement {
  token: Token
  // statements: Statement[] = []
  statements: (LetStatement | ExpressionStatement | ReturnStatement)[] = []

  constructor(token: Token) {
    this.token = token
  }
  statementNode() { }
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return this.statements.map(s => s.string()).join('')
  }
}

class FunctionLiteral implements Expression {
  token: Token // the 'fn' token
  parameters: Identifier[] = []
  // should we use ts non-null assertion here?
  // body: BlockStatement | null = null
  body!: BlockStatement

  constructor(token: Token) {
    this.token = token
  }

  expressionNode() { }
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return `${this.token.literal}(${this.parameters.map(p => p.string()).join(', ')}) ${this.body?.string()}`
  }
}

class CallExpression implements Expression {
  token: Token // the '(' token
  fn: Expression // identifier or function literal
  args: Expression[] = []

  constructor(token: Token, fn: Expression) {
    this.token = token
    this.fn = fn
  }
  expressionNode() { }
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return `${this.fn.string()}(${this.args.map(a => a.string()).join(', ')})`
  }
}

class ArrayLiteral implements Expression {
  token: Token // the '[' token
  elements: Expression[] = []

  constructor(token: Token, elements: Expression[]) {
    this.token = token
    this.elements = elements
  }
  expressionNode() { }
  tokenLiteral() {
    return this.token.literal
  }
  string() {
    return `[${this.elements.join(', ')}]`
  }
}

type Node =
  | ASTNode
  | Expression
  | Statement
  | Identifier
  | Program
  | LetStatement
  | ReturnStatement
  | ExpressionStatement
  | IntegerLiteral
  | PrefixExpression
  | InfixExpression
  | Boolean
  | IfExpression
  | BlockStatement
  | FunctionLiteral
  | CallExpression
  | ArrayLiteral

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
  IfExpression,
  BlockStatement,
  FunctionLiteral,
  CallExpression,
  Node,
  StringLiteral,
  ArrayLiteral,
}