import Lexer from '../lexer'
import Parser from '../parser'
import * as object from '../object'
import evaluate, { NULL } from './'

describe('evaluator', () => {
  // TestEvalIntegerExpression
  test.each([
    ['5', 5],
    ['10', 10],
    ['-5', -5],
    ['-10', -10],
    ['5 + 5 + 5 + 5 - 10', 10],
    ['2 * 2 * 2 * 2 * 2', 32],
    ['-50 + 100 + -50', 0],
    ['5 * 2 + 10', 20],
    ['5 + 2 * 10', 25],
    ['20 + 2 * -10', 0],
    ['50 / 2 * 2 + 10', 60],
    ['2 * (5 + 10)', 30],
    ['3 * 3 * 3 + 10', 37],
    ['3 * (3 * 3) + 10', 37],
    ['(5 + 10 * 2 + 15 / 3) * 2 + -10', 50],
  ])('evaluates integer expressions', (input, expected) => {
    const integerObj = testEval(input) as object.Integer
    testIntegerObject(expect, integerObj, expected)
  })

  // TestEvalBooleanExpression
  test.each([
    ['true', true],
    ['false', false],
    ['1 < 2', true],
    ['1 > 2', false],
    ['1 < 1', false],
    ['1 > 1', false],
    ['1 == 1', true],
    ['1 != 1', false],
    ['1 == 2', false],
    ['1 != 2', true],
    ['true == true', true],
    ['false == false', true],
    ['true == false', false],
    ['true != false', true],
    ['false != true', true],
    ['(1 < 2) == true', true],
    ['(1 < 2) == false', false],
    ['(1 > 2) == true', false],
    ['(1 > 2) == false', true],
  ])('evaluates boolean expressions', (input, expected) => {
    const booleanObj = testEval(input) as object.Boolean
    testBooleanObject(expect, booleanObj, expected)
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
    const booleanObj = testEval(input) as object.Boolean
    testBooleanObject(expect, booleanObj, expected)
  })

  // TestIfElseExpressions
  test.each([
    ['if (true) { 10 }', 10],
    ['if (false) { 10 }', null],
    ['if (1) { 10 }', 10],
    ['if (1 < 2) { 10 }', 10],
    ['if (1 > 2) { 10 }', null],
    ['if (1 > 2) { 10 } else { 20 }', 20],
    ['if (1 < 2) { 10 } else { 20 }', 10],
  ])('evaluates conditional expressions', (input, expected) => {
    const evaluated = testEval(input) 
    if (typeof expected === 'number') {
      testIntegerObject(expect, (evaluated as object.Integer), expected)
    } else {
      testNullObject(expect, (evaluated as object.Null))
    }
  })

  // TestReturnStatements
  test.each([
    ['return 10;', 10],
    ['return 10; 9;', 10],
    ['return 2 * 7; 9;', 14],
    ['9; return 2 + 3; 9;', 5],
    [
      `if (10 > 1) {
        if (10 > 1) {
          return 10;
        }
        return 1;
      }`,
      10
    ]
  ])('evaluates return statements', (input, expected) => {
    const integerObj = testEval(input) as object.Integer
    testIntegerObject(expect, integerObj, expected)
  })

  // TestErrorHandling
  test.each([
    ['5 + true;', 'type mismatch: INTEGER + BOOLEAN'],
    ['5 + true; 5;', 'type mismatch: INTEGER + BOOLEAN'],
    ['-true;', 'unkown operator: -BOOLEAN'],
    ['true + false;', 'unkown operator: BOOLEAN + BOOLEAN'],
    ['5; true + false; 5;', 'unkown operator: BOOLEAN + BOOLEAN'],
    ['if (10 > 1) { true + false; }', 'unkown operator: BOOLEAN + BOOLEAN'],
    ['if (10 > 1) { true + false; }', 'unkown operator: BOOLEAN + BOOLEAN'],
    [
      `if (10 > 1) {
        if (10 > 1) {
          return true - false;
        }
        return 1;
      }`,
      'unkown operator: BOOLEAN - BOOLEAN'
    ],
  ])('handles errors', (input, expected) => {
    const errorObj = testEval(input) as object.Error
    expect(errorObj).toBeInstanceOf(object.Error)
    expect(errorObj.message).toBe(expected)

  })
})

function testEval(input: string) {
  const l = new Lexer(input)
  const p = new Parser(l)
  const program = p.parseProgram()

  return evaluate(program)
}

function testIntegerObject(expect: jest.Expect, obj: object.Integer, expected: number | null) {
  expect(obj).toBeInstanceOf(object.Integer)
  expect(obj?.value).toBe(expected)
}

function testBooleanObject(expect: jest.Expect, obj: object.Boolean, expected: boolean) {
  expect(obj).toBeInstanceOf(object.Boolean)
  expect(obj?.value).toBe(expected)
}

function testNullObject(expect: jest.Expect, obj: object.Null) {
  expect(obj).toBe(NULL)
}
