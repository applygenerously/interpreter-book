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
    ],
  ])('evaluates return statements', (input, expected) => {
    const integerObj = testEval(input) as object.Integer
    testIntegerObject(expect, integerObj, expected)
  })

  // TestErrorHandling
  test.each([
    ['5 + true;', 'type mismatch: INTEGER + BOOLEAN'],
    ['5 + true; 5;', 'type mismatch: INTEGER + BOOLEAN'],
    ['-true;', 'unknown operator: -BOOLEAN'],
    ['true + false;', 'unknown operator: BOOLEAN + BOOLEAN'],
    ['5; true + false; 5;', 'unknown operator: BOOLEAN + BOOLEAN'],
    ['if (10 > 1) { true + false; }', 'unknown operator: BOOLEAN + BOOLEAN'],
    ['if (10 > 1) { true + false; }', 'unknown operator: BOOLEAN + BOOLEAN'],
    [
      `if (10 > 1) {
        if (10 > 1) {
          return true - false;
        }
        return 1;
      }`,
      'unknown operator: BOOLEAN - BOOLEAN'
    ],
    ['"hello" - "world"', 'unknown operator: STRING - STRING'],
  ])('handles errors', (input, expected) => {
    const errorObj = testEval(input) as object.Error
    expect(errorObj).toBeInstanceOf(object.Error)
    expect(errorObj.message).toBe(expected)
  })

  // TestLetStatements
  test.each([
    ['let a = 5; a;', 5],
    ['let a = 5 * 5; a;', 25],
    ['let a = 5; let b = a; b;', 5],
    ['let a = 5; let b = a; let c = a + b + 5; c;', 15],
  ])('evaluates let statements', (input, expected) => {
    const evaluated = testEval(input)
    testIntegerObject(expect, (evaluated as object.Integer), expected)
  })

  // TestFunctionObject
  test('evaluates functions', () => {
    const input = 'fn(x) { x + 2; };'
    const fn = testEval(input) as object.Function
    expect(fn).toBeInstanceOf(object.Function)
    expect(fn.parameters.length).toBe(1)
    expect(fn.parameters[0].string()).toBe('x')
    expect(fn.body.string()).toBe('(x + 2)')
  })

  // TestFunctionApplication
  test.each([
    ['let identity = fn(x) { x; }; identity(5);', 5],
    ['let identity = fn(x) { return x; }; identity(5);', 5],
    ['let double = fn(x) { x * 2 }; double(5);', 10],
    ['let add = fn(x, y) { x + y }; add(5, 6);', 11],
    ['let add = fn(x, y) { x + y }; add(5 + 5, add(5, 5));', 20],
    ['fn(x) { x; }(5)', 5],
  ])('evaluates function application', (input, expected) => {
    const evaluated = testEval(input)
    testIntegerObject(expect, (evaluated as object.Integer), expected)
  })

  // TestClosures
  test('evaluates closures', () => {
    const input = `
      let newAdder = fn(x) {
        fn(y) { x + y };
      };
  
      let addTwo = newAdder(2);
      addTwo(2);
    `
    testIntegerObject(expect, (testEval(input) as object.Integer), 4)
  })

  // TestStringLiteral
  test('evaluates strings', () => {
    const input = '"hello world!"'
    const evaluated = testEval(input) as object.String
    expect(evaluated).toBeInstanceOf(object.String)
    expect(evaluated.value).toBe('hello world!')
  })

  // TestStringConcatenation
  test('concatenates strings', () => {
    const input = `"hello" + " " +  "world!"`
    const evaluated = testEval(input) as object.String
    expect(evaluated).toBeInstanceOf(object.String)
    expect(evaluated.value).toBe('hello world!')
  })

  // TestBuiltinFunctions
  test.each([
    ['len("")', 0],
    ['len("four")', 4],
    ['len("hello world")', 11],
    ['len(1)', 'argument to `len` not supported, got INTEGER'],
    ['len("one", "two")', 'wrong number of arguments. got=2, want=1'],
    ['len([1, 2, 3])', 3],
    ['len([])', 0],
    ['puts("hello", "world!")', null],
    ['first([1, 2, 3])', 1],
    ['first([])', null],
    ['first(1)', 'argument to \'first\' must be ARRAY, got INTEGER'],
    ['last([1, 2, 3])', 3],
    ['last([])', null],
    ['last(1)', 'argument to \'last\' must be ARRAY, got INTEGER'],
    ['rest([1, 2, 3])', [2, 3]],
    ['rest([])', null],
    ['push([], 1)', [1]],
    ['push(1, 1)', 'argument to \'push\' must be ARRAY, got INTEGER'],
  ])('evaluates builtin functions', (input, expected) => {
    const evaluated = testEval(input)
    if (typeof expected === 'number') {
      const integerObj = evaluated as object.Integer
      testIntegerObject(expect, integerObj, expected)
    }
    if (typeof expected === 'string') {
      const errorObj = evaluated as object.Error
      expect(errorObj.type).toBe(object.ObjectType.ERROR_OBJ)
      expect(errorObj.message).toBe(expected)
    }
    if (typeof expected === null) {
      const nullObj = evaluated as object.Null
      testNullObject(expect, nullObj)
    }
    if (Array.isArray(expected)) {
      const arrayObj = evaluated as object.Array
      expect(arrayObj.type).toBe(object.ObjectType.ARRAY_OBJ)
      expect(arrayObj.elements.length).toBe(expected.length)
      expected.forEach((e, i) => {
        const el = arrayObj.elements[i] as object.Integer
        testIntegerObject(expect, el, e)
      })
    }
  })

  // TestArrayLiterals
  test('evaluates array literals', () => {
    const input = '[1, 2 * 2, 3 + 3]'
    const evaluated = testEval(input) as object.Array
    expect(evaluated).toBeInstanceOf(object.Array)
    expect(evaluated.elements.length).toBe(3)
    testIntegerObject(expect, (evaluated.elements[0] as object.Integer), 1)
    testIntegerObject(expect, (evaluated.elements[1] as object.Integer), 4)
    testIntegerObject(expect, (evaluated.elements[2] as object.Integer), 6)
  })

  // TestArrayIndexExpressions
  test.each([
    ['[1, 2, 3][0]', 1],
    ['[1, 2, 3][1]', 2],
    ['[1, 2, 3][2]', 3],
    ['let i = 0; [1][i]', 1],
    ['[1, 2, 3][1 + 1]', 3],
    ['let myArray = [1, 2, 3]; myArray[2]', 3],
    ['let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2]', 6],
    ['let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]', 2],
    ['[1, 2, 3][3]', null],
    ['[1, 2, 3][-1]', null],
  ])('evaluates array index expressions', (input, expected) => {
    const evaluated = testEval(input)
    if (typeof expected === 'number') {
      testIntegerObject(expect, (evaluated as object.Integer), expected)
    } else {
      testNullObject(expect, (evaluated as object.Null))
    }
  })
})

function testEval(input: string) {
  const l = new Lexer(input)
  const p = new Parser(l)
  const program = p.parseProgram()
  const env = new object.Environment()

  return evaluate(program, env)
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
