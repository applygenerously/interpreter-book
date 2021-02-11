import Lexer from '../lexer'
import Parser from '../parser'
import * as object from '../object'
import evaluate from './'

describe('evaluator', () => {
  // TestEvalIntegerExpression
  test.each([
    ['5', 5],
    ['10', 10],
    ['-5', -5],
    ['-10', -10],
  ])('evaluates integer expressions', (input, expected) => {
    const evaluated = testEval(input) as object.Integer
    testIntegerObject(expect, evaluated, expected)
  })

  // TestEvalBooleanExpression
  test.each([
    ['true', true],
    ['false', false],
  ])('evaluates boolean expressions', (input, expected) => {
    const evaluated = testEval(input) as object.Boolean
    testBooleanObject(expect, evaluated, expected)
  })

  // TestBangOperator
  test.each([
    ['!true', false],
    ['!false', true],
    ['!5', false],
    ['!!5', true],
    ['!!true', true],
    ['!!false', false],
  ])('evaluates bang operators', (input, expected) => {
    const evaluated = testEval(input) as object.Boolean
    testBooleanObject(expect, evaluated, expected)
  })
})

function testEval(input: string) {
  const l = new Lexer(input)
  const p = new Parser(l)
  const program = p.parseProgram()

  return evaluate(program)
}

function testIntegerObject(expect: jest.Expect, obj: object.Integer | null, expected: number) {
  expect(obj).toBeInstanceOf(object.Integer)
  expect(obj?.value).toBe(expected)
}

function testBooleanObject(expect: jest.Expect, obj: object.Boolean | null, expected: boolean) {
  expect(obj).toBeInstanceOf(object.Boolean)
  expect(obj?.value).toBe(expected)
}
