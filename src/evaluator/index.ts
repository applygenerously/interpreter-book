import * as ast from '../ast'
import * as object from '../object'

const TRUE = new object.Boolean(true)
const FALSE = new object.Boolean(false)
export const NULL = new object.Null()

export default function evaluate(node: ast.Node, env: object.Environment): object.Object {
  // typescript doesn't like switch statement   
  if (node?.constructor === ast.Boolean) {
    return nativeBoolToBooleanObject(node.value)
  }

  if (node?.constructor === ast.IntegerLiteral) {
    return new object.Integer(node.value)
  }

  if (node?.constructor === ast.ExpressionStatement) {
    return evaluate(node.expression, env)
  }

  if (node?.constructor === ast.LetStatement) {
    const value = evaluate(node.value, env)
    if (isError(value)) {
      return value
    }

    env.set(node.name.value, value)
  }

  if (node?.constructor === ast.FunctionLiteral) {
    return new object.Function(node.parameters, node.body, env)
  }

  if (node?.constructor === ast.CallExpression) {
    const fn = evaluate(node.fn, env) as object.Function
    if (isError(fn)) {
      return fn
    }

    const args = evalExpressions(node.args, env)
    if (args.length === 1 && isError(args[0])) {
      return args[0]
    }

    return applyFunction(fn, args)
  }

  if (node?.constructor === ast.Identifier) {
    return evalIdentifier(node, env)
  }

  if (node?.constructor === ast.PrefixExpression) {
    const right = evaluate(node.right, env)
    if (isError(right)) {
      return right
    }

    return evalPrefixExpression(node.operator, right)
  }

  if (node?.constructor === ast.InfixExpression) {
    const left = evaluate(node.left, env)
    if (isError(left)) {
      return left
    }

    const right = evaluate(node.right, env)
    if (isError(right)) {
      return right
    }

    return evalInfixExpression(node.operator, left, right)
  }

  if (node?.constructor === ast.Program) {
    return evalProgram(node, env)
  }

  if (node?.constructor === ast.IfExpression) {
    return evalIfExpression(node, env)
  }

  if (node?.constructor === ast.ReturnStatement) {
    const value = evaluate(node.returnValue, env)
    if (isError(value)) {
      return value
    }

    return new object.ReturnValue(value)
  }

  if (node?.constructor === ast.BlockStatement) {
    return evalBlockStatement(node, env)
  }

  return NULL
}

function evalProgram(program: ast.Program, env: object.Environment) {
  let result: object.Object = NULL

  for (const statement of program.statements) {
    result = evaluate(statement, env)

    if (result.constructor === object.ReturnValue) {
      return result.value
    }

    if (result.constructor === object.Error) {
      return result
    }
  }

  return result
}

function evalBlockStatement(block: ast.BlockStatement, env: object.Environment) {
  let result: object.Object = NULL

  for (const statement of block.statements) {
    result = evaluate(statement, env)

    if (
      result != null &&
      result.type === object.ObjectType.RETURN_VALUE_OBJ ||
      object.ObjectType.ERROR_OBJ
    ) {
      return result
    }
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
      return new object.Error(`unknown operator: ${operator}${right.type}`)
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
    return new object.Error(`unkown operator: -${right.type}`)
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

  if (left.type !== right.type) {
    return new object.Error(`type mismatch: ${left.type} ${operator} ${right.type}`)
  }

  return new object.Error(`unkown operator: ${left.type} ${operator} ${right.type}`)
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
      return new object.Error(`unknown operator: ${left.type} ${operator} ${right.type}`)
  }
}

function evalIfExpression(node: ast.IfExpression, env: object.Environment) {
  const condition = evaluate(node.condition, env)

  if (isError(condition)) {
    return condition
  }

  if (isTruthy(condition)) {
    return evaluate(node.consequence, env)
  } else if (node.alternative) {
    return evaluate(node.alternative, env)
  } else {
    return NULL
  }
}

function evalIdentifier(node: ast.Identifier, env: object.Environment): object.Object {
  const isBound = env.has(node.value)
  if (!isBound) {
    return new object.Error(`identifier not found: ${node.value}`)
  }
  // @ts-ignore
  return env.get(node.value)
}

function evalExpressions(exps: ast.Expression[], env: object.Environment) {
  const result = []
  for (const e of exps) {
    const evaluated = evaluate(e, env)
    if (isError(evaluated)) {
      return [evaluated]
    }
    result.push(evaluated)
  }
  return result
}

function applyFunction(fn: object.Function, args: object.Object[]) {
  if (fn.constructor !== object.Function) {
    return new object.Error(`not a function: ${fn.type}`)
  }

  const extendedEnv = extendFunctionEnv(fn, args)
  const evaluated = evaluate(fn.body, extendedEnv)
  return unwrapReturnValue(evaluated)
}

function extendFunctionEnv(fn: object.Function, args: object.Object[]) {
  const env = object.newEnclosedEnvironment(fn.env)

  for (const paramIdx in fn.parameters) {
    env.set(fn.parameters[paramIdx].value, args[paramIdx])
  }

  return env
}

function unwrapReturnValue(obj: object.Object) {
  if (obj.constructor === object.ReturnValue) {
    return obj.value
  }

  return obj
}

function isTruthy(obj: object.Object) {
  switch (obj) {
    case NULL:
      return false
    case TRUE:
      return true
    case FALSE:
      return false
    default:
      return true
  }
}

function isError(obj: object.Object) {
  if (obj !== null) {
    return obj.type === object.ObjectType.ERROR_OBJ
  }
  return false
}