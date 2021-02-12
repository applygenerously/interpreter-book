import * as ast from '../ast'
import * as object from '../object'

const TRUE = new object.Boolean(true)
const FALSE = new object.Boolean(false)
export const NULL = new object.Null()

export default function evaluate(node: ast.Node): object.Object {
  // typescript doesn't like switch statement   
  if (node?.constructor === ast.Boolean) {
    return nativeBoolToBooleanObject(node.value)
  }

  if (node?.constructor === ast.IntegerLiteral) {
    return new object.Integer(node.value)
  }

  if (node?.constructor === ast.ExpressionStatement) {
    return evaluate(node.expression)
  }

  if (node?.constructor === ast.PrefixExpression) {
    const right = evaluate(node.right)
    return evalPrefixExpression(node.operator, right)
  }

  if (node?.constructor === ast.InfixExpression) {
    const left = evaluate(node.left)
    const right = evaluate(node.right)
    return evalInfixExpression(node.operator, left, right)
  }

  if (node?.constructor === ast.Program) {
    return evalStatements(node.statements)
  }

  return NULL
}

function evalStatements(statements: ast.Program['statements']): object.Object {
  let result: object.Object = NULL

  for (const statement of statements) {
    result = evaluate(statement)
  }

  return result
}

function nativeBoolToBooleanObject(bool: boolean) {
  return bool ? TRUE : FALSE
}

function evalPrefixExpression(operator: string, right: object.Object) {
  switch (operator) {
    case '!':
      return evalBangOperatorExpression(right)
    case '-':
      return evalMinusPrefixOperatorExpression(right)
    default:
      return NULL
  }
}

function evalBangOperatorExpression(right: object.Object) {
  switch (right) {
    case TRUE:
      return FALSE
    case FALSE:
      return TRUE
    case NULL:
      return TRUE
    default:
      return FALSE
  }
}

function evalMinusPrefixOperatorExpression(right: object.Object) {
  if (right.type !== object.ObjectType.INTEGER_OBJ) {
    return NULL
  }

  return new object.Integer(-(right as object.Integer).value)
}

function evalInfixExpression(operator: string, left: object.Object, right: object.Object) {
  // if left and right operands are numbers
  if (left.type === object.ObjectType.INTEGER_OBJ && right.type === object.ObjectType.INTEGER_OBJ) {
    return evalIntegerInfixExpression(operator, (left as object.Integer), (right as object.Integer))
  }

  // if left and right operands are booleans
  if (operator === '==') {
    return nativeBoolToBooleanObject(left === right)
  }

  if (operator === '!=') {
    return nativeBoolToBooleanObject(left !== right)
  }

  // handle other values later
  return NULL
}

function evalIntegerInfixExpression(operator: string, left: object.Integer, right: object.Integer) {
  const leftVal = left.value
  const rightVal = right.value

  switch (operator) {
    case '+':
      return new object.Integer(leftVal + rightVal)
    case '-':
      return new object.Integer(leftVal - rightVal)
    case '*':
      return new object.Integer(leftVal * rightVal)
    case '/':
      return new object.Integer(leftVal / rightVal)
    case '<':
      return nativeBoolToBooleanObject(leftVal < rightVal)
    case '>':
      return nativeBoolToBooleanObject(leftVal > rightVal)
    case '==':
      return nativeBoolToBooleanObject(leftVal === rightVal)
    case '!=':
      return nativeBoolToBooleanObject(leftVal !== rightVal)
    default:
      return NULL
  }
}