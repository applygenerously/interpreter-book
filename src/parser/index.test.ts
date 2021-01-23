import Lexer from '../lexer'
import { 
  ExpressionStatement, 
  Identifier, 
  LetStatement, 
  ReturnStatement,
  IntegerLiteral, 
  PrefixExpression,
  InfixExpression,
  Expression,
  Boolean
} from '../ast'
import Parser from './'

describe('parser', () => {
  test('parses let statements', () => {
    const input =
    `let x = 5;
    let y = 10;
    let foobar = 838383;`

    const l = new Lexer(input)
    const p = new Parser(l)

    const program = p.parseProgram()
    checkParserErrors(p)

    if (program === null) {
      fail('parseProgram() returned null')
    }
    if (program.statements.length !== 3) {
      fail(`program.statements does not contain 3 statements, got ${program.statements.length}`)
    }

    const expected = [
      'x',
      'y',
      'foobar',
    ]

    for (const [i, e] of expected.entries()) {
      let statement = program.statements[i] as LetStatement
      testLetStatement(expect, statement, e)
    }
  })

  test('parses return statements', () => {
    const input =
    `return 5;
    return 10;
    return 993322;`

    const l = new Lexer(input)
    const p = new Parser(l)

    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(3)
    for (const statement of program.statements) {
      expect(statement).toBeInstanceOf(ReturnStatement)
      expect(statement.tokenLiteral()).toBe('return')
    }
  })

  test('parses identifier expressions', () => {
    const input = 'foobar;'

    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0] as ExpressionStatement
    expect(statement).toBeInstanceOf(ExpressionStatement)
    const identifier = statement.expression as Identifier
    expect(identifier).toBeInstanceOf(Identifier)
    expect(identifier.value).toBe('foobar')
    expect(identifier?.tokenLiteral()).toBe('foobar')
  })

  test('parses integer literal expressions', () => {
    const input = '5;'

    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0] as ExpressionStatement
    expect(statement).toBeInstanceOf(ExpressionStatement)
    const literal = statement.expression as IntegerLiteral
    expect(literal).toBeInstanceOf(IntegerLiteral)
    expect(literal.value).toBe(5)
    expect(literal.tokenLiteral()).toBe('5')
  })

  test.each([
    ['!5;', '!', 5],
    ['-15', '-', 15],
    ['!true', '!', true],
    ['!false', '!', false],
  ])('parses prefix expressions', (input, operator, value) => {
    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0] as ExpressionStatement
    expect(statement).toBeInstanceOf(ExpressionStatement)
    const expression = statement.expression as PrefixExpression
    expect(expression).toBeInstanceOf(PrefixExpression)
    expect(expression.operator).toBe(operator)
    testLiteralExpression(expect, expression.right, value)
  })

  test.each([
    ['5 + 5;', 5, '+', 5],
    ['5 - 5;', 5, '-', 5],
    ['5 * 5;', 5, '*', 5],
    ['5 / 5;', 5, '/', 5],
    ['5 > 5;', 5, '>', 5],
    ['5 < 5;', 5, '<', 5],
    ['5 == 5;', 5, '==', 5],
    ['5 != 5;', 5, '!=', 5],
    ['true == true', true, '==', true],
    ['true != false', true, '!=', false],
    ['false == false', false, '==', false],
  ])('parses infix expressions', (input, leftValue, operator, rightValue) => {
    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0] as ExpressionStatement
    testsInfixExpression(expect, statement.expression, leftValue, operator, rightValue)
  })

  test.each([
    ['-a * b', '((-a) * b)'],
    ['!-a', '(!(-a))'],
    ['a + b + c', '((a + b) + c)'],
    ['a + b - c', '((a + b) - c)'],
    ['a * b * c', '((a * b) * c)'],
    ['a * b / c', '((a * b) / c)'],
    ['a + b / c', '(a + (b / c))'],
    ['a + b * c + d / e - f', '(((a + (b * c)) + (d / e)) - f)'],
    // source shows no space between expected statements?
    // '(3 + 4)((-5) * 5)'
    ['3 + 4; -5 * 5', '(3 + 4) ((-5) * 5)'],
    ['5 > 4 == 3 < 4', '((5 > 4) == (3 < 4))'],
    ['5 < 4 != 3 > 4', '((5 < 4) != (3 > 4))'],
    ['3 + 4 * 5 == 3 * 1 + 4 * 5', '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))'],
    ['true', 'true'],
    ['false', 'false'],
    ['3 > 5 == false', '((3 > 5) == false)'],
    ['3 < 5 == true', '((3 < 5) == true)'],
  ])('parses operators in correct precedence', (input, expected) => {
    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    const actual = program.string()
    expect(actual).toBe(expected)
  })

  test.each([
    ['true', true],
    ['false', false],
  ])('parses boolean expressions', (input, expected) => {
    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const expression = program.statements[0].expression as Boolean
    expect(expression).toBeInstanceOf(Boolean)
    expect(expression.value).toBe(expected)
  })
})

function testLetStatement(expect: jest.Expect, statement: LetStatement, expected: string) {
  expect(statement.tokenLiteral()).toEqual('let')
  expect(statement).toBeInstanceOf(LetStatement)
  expect(statement.name!.value).toBe(expected)
  expect(statement.name!.tokenLiteral()).toBe(expected)
}

function testIntegerLiteral(expect: jest.Expect, il: IntegerLiteral, value: number) {
  expect(il).toBeInstanceOf(IntegerLiteral)
  expect(il.value).toBe(value)
  expect(il.tokenLiteral()).toBe(value.toString())
}

function testIdentifier(expect: jest.Expect, ident: Identifier, value: string) {
  expect(ident).toBeInstanceOf(Identifier)
  expect(ident.value).toBe(value)
  expect(ident.tokenLiteral()).toBe(value.toString())
}

function testBooleanLiteral(expect: jest.Expect, bool: Boolean, value: boolean) {
  expect(bool).toBeInstanceOf(Boolean)
  expect(bool.value).toBe(value)
  expect(bool.tokenLiteral()).toBe(value.toString())
}

function testLiteralExpression(expect: jest.Expect, exp: Expression, expected: unknown) {
  const type = typeof expected
  switch (type) {
    case 'number':
      return testIntegerLiteral(expect, exp, expected)
    case 'string':
      return testIdentifier(expect, exp, expected)
    case 'boolean':
      return testBooleanLiteral(expect, exp, expected)
    default:
      throw new Error(`type of exp not handled. got ${exp.constructor.name}`)
  }
}

function testsInfixExpression(
  expect: jest.Expect,
  exp: InfixExpression,
  left: InfixExpression['left'],
  operator: string,
  right: Expression,
) {
  expect(exp).toBeInstanceOf(InfixExpression)
  testLiteralExpression(expect, exp.left, left)
  expect(exp.operator).toBe(operator)
  testLiteralExpression(expect, exp.right, right)
}

function checkParserErrors(p: Parser) {
  const errors = p.errors
  if (errors.length === 0) {
    return
  }

  for (const error of errors) {
    console.error(`Parser had error: ${error}`)
  }

  fail(`Parser had ${errors.length} errors`)
}