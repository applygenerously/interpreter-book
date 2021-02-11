import * as ast from '../ast'
import * as object from '../object'

const TRUE = new object.Boolean(true)
const FALSE = new object.Boolean(false)
const NULL = new object.Null()

export default function evaluate(node: ast.Node | null): object.Object | null {
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

  if (node?.constructor === ast.Program) {
    return evalStatements(node.statements)
  }

  return null
}

function evalStatements(statements: ast.Program['statements']): object.Object | null {
  let result = null

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

  return new object.Integer(-right.value)
}