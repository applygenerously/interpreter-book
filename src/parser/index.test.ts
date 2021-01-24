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
  Boolean,
  IfExpression,
  FunctionLiteral,
  CallExpression,
} from '../ast'
import Parser from './'

describe('parser', () => {
  // TestLetStatements
  test.each([
    ['let x = 5;', 'x', 5],
    ['let y = true;', 'y', true],
    ['let foobar = y;', 'foobar', 'y']
  ])('parses let statements', (input, expectedIdent, expectedVal) => {
    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0]
    testLetStatement(expect, statement, expectedIdent)
    testLiteralExpression(expect, statement.value, expectedVal)
  })

  // TestReturnStatements
  test.each([
    ['return 5;', 5],
    ['return true;', true],
    ['return foobar;', 'foobar'],
  ])('parses return statements', (input, expected) => {
    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0] as ReturnStatement
    expect(statement).toBeInstanceOf(ReturnStatement)
    expect(statement.tokenLiteral()).toBe('return')
    testLiteralExpression(expect, statement.returnValue, expected)
  })

  // TestIdentifierExpressions
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

  // TestIntegerLiteralExpressions
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

  // TestParsingPrefixExpressions
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

  // TestParsingInfixExpressions
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
    testInfixExpression(expect, statement.expression, leftValue, operator, rightValue)
  })

  // TestOperatorPrecedenceParsing
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
    ['1 + (2 + 3) + 4', '((1 + (2 + 3)) + 4)'],
    ['(5 + 5) * 2', '((5 + 5) * 2)'],
    ['2 / (5 + 5)', '(2 / (5 + 5))'],
    ['-(5 + 5)', '(-(5 + 5))'],
    ['!(true == true)', '(!(true == true))'],
    ['a + add(b * c) + d', '((a + add((b * c))) + d)'],
    ['add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))', 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))'],
    ['add(a + b + c * d / f + g)', 'add((((a + b) + ((c * d) / f)) + g))'],
  ])('parses operators in correct precedence', (input, expected) => {
    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    const actual = program.string()
    expect(actual).toBe(expected)
  })

  // TestBooleanExpression
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

  // TestIfExpression
  test('parses if expressions', () => {
    const input = 'if (x < y) { x }'

    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0] as ExpressionStatement
    expect(statement).toBeInstanceOf(ExpressionStatement)
    const expression = statement.expression as IfExpression
    expect(expression).toBeInstanceOf(IfExpression)
    testInfixExpression(expect, expression.condition, 'x', '<', 'y')
    expect(expression.consequence.statements.length).toBe(1)
    const consequence = expression.consequence.statements[0]
    expect(consequence).toBeInstanceOf(ExpressionStatement)
    testIdentifier(expect, consequence.expression, 'x')
    expect(expression.alternative).toBeFalsy()
  })

  // TestIfElseExpression
  test('parses if else expressions', () => {
    const input = 'if (x < y) { x } else { y }'

    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0] as ExpressionStatement
    expect(statement).toBeInstanceOf(ExpressionStatement)
    const expression = statement.expression as IfExpression
    expect(expression).toBeInstanceOf(IfExpression)
    testInfixExpression(expect, expression.condition, 'x', '<', 'y')
    expect(expression.consequence.statements.length).toBe(1)
    const consequence = expression.consequence.statements[0]
    expect(consequence).toBeInstanceOf(ExpressionStatement)
    testIdentifier(expect, consequence.expression, 'x')
    expect(expression.alternative.statements.length).toBe(1)
    const alternative = expression.alternative.statements[0]
    expect(alternative).toBeInstanceOf(ExpressionStatement)
    testIdentifier(expect, alternative.expression, 'y')
  })

  // TestFunctionLiteralParsing
  test('parses function literals', () => {
    const input = 'fn(x, y) { x + y }'

    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0]
    expect(statement).toBeInstanceOf(ExpressionStatement)
    const fn = statement.expression
    expect(fn).toBeInstanceOf(FunctionLiteral)
    expect(fn.parameters.length).toBe(2)

    testLiteralExpression(expect, fn.parameters[0], 'x')
    testLiteralExpression(expect, fn.parameters[1], 'y')

    expect(fn.body.statements.length).toBe(1)
    const bodyStatement = fn.body.statements[0]
    expect(bodyStatement).toBeInstanceOf(ExpressionStatement)
    testInfixExpression(expect, bodyStatement.expression, 'x', '+', 'y')
  })

  // TestFunctionParameterParsing
  test.each([
    ['fn() {}', []],
    ['fn(x) {}', ['x']],
    ['fn(x, y, z) {}', ['x', 'y', 'z']],
  ])('parses function literal parameters', (input, expected) => {
    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    const fn = program.statements[0].expression
    expect(fn.parameters.length).toBe(expected.length)
    for (const [i, expectedParam] of expected.entries()) {
      testLiteralExpression(expect, fn.parameters[i], expectedParam)
    }
  })

  // TestCallExpressionParsing
  test('parses call expressions', () => {
    const input = 'add(1, 2 * 3, 4 + 5);'

    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    expect(program.statements.length).toBe(1)
    const statement = program.statements[0]
    expect(statement).toBeInstanceOf(ExpressionStatement)
    const expression = statement.expression as CallExpression
    expect(expression).toBeInstanceOf(CallExpression)
    testIdentifier(expect, expression.fn, 'add')
    expect(expression.args.length).toBe(3)
    testLiteralExpression(expect, expression.args[0], 1)
    testInfixExpression(expect, expression.args[1], 2, '*', 3)
    testInfixExpression(expect, expression.args[2], 4, '+', 5)
  })

  // TestCallExpressionParameterParsing
  test.each([
    ['add();', 'add', []],
    ['add(1);', 'add', ['1']],
    ['add(1, 2 * 3, 4 + 5);', 'add', ['1', '(2 * 3)', '(4 + 5)']],
  ])('parses call expression parameters', (input, expectedIdent, expectedArgs) => {
    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    checkParserErrors(p)

    const expression = program.statements[0].expression
    expect(expression).toBeInstanceOf(CallExpression)
    testIdentifier(expect, expression.fn, expectedIdent)
    expect(expression.args.length).toBe(expectedArgs.length)
    for (const [i, arg] of expectedArgs.entries()) {
      expect(expression.args[i].string()).toBe(arg)
    }
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

function testInfixExpression(
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