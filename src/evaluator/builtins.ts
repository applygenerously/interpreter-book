import * as object from '../object'
import { NULL } from '../evaluator'

const len = new object.Builtin((...args: object.Object[]) => {
  if (args.length !== 1) {
    return new object.Error(`wrong number of arguments. got=${args.length}, want=1`)
  }
  const arg = args[0]
  switch (arg.type) {
    case object.ObjectType.STRING_OBJ:
      const stringObj = arg as object.String
      return new object.Integer(stringObj.value.length)
    case object.ObjectType.ARRAY_OBJ:
      const arrObj = arg as object.Array
      return new object.Integer(arrObj.elements.length)
    default:
      return new object.Error(`argument to \`len\` not supported, got ${arg.type}`)
  }
})

const first = new object.Builtin((...args: object.Object[]) => {
  if (args.length !== 1) {
    return new object.Error(`wrong number of arguments. got=${args.length}, want=1`)
  }
  if (args[0].type !== object.ObjectType.ARRAY_OBJ) {
    return new object.Error(`argument to \`first\` must be ARRAY, got ${args[0].type}`)
  }
  const arr = args[0] as object.Array
  if (arr.elements.length > 0) {
    return arr.elements[0]
  }
  return NULL
})

const last = new object.Builtin((...args: object.Object[]) => {
  if (args.length !== 1) {
    return new object.Error(`wrong number of arguments. got=${args.length}, want=1`)
  }
  if (args[0].type !== object.ObjectType.ARRAY_OBJ) {
    return new object.Error(`argument to \`last\` must be ARRAY, got ${args[0].type}`)
  }
  const arr = args[0] as object.Array
  const length = arr.elements.length
  if (length > 0) {
    return arr.elements[length - 1]
  }
  return NULL
})

const rest = new object.Builtin((...args: object.Object[]) => {
  if (args.length !== 1) {
    return new object.Error(`wrong number of arguments. got=${args.length}, want=1`)
  }
  if (args[0].type !== object.ObjectType.ARRAY_OBJ) {
    return new object.Error(`argument to \`rest\` must be ARRAY, got ${args[0].type}`)
  }
  const arr = args[0] as object.Array
  const length = arr.elements.length
  if (length > 0) {
    const [, ...rest] = arr.elements
    return new object.Array(rest)
  }
  return NULL
})

const push = new object.Builtin((...args: object.Object[]) => {
  if (args.length !== 2) {
    return new object.Error(`wrong number of arguments. got=${args.length}, want=2`)
  }
  if (args[0].type !== object.ObjectType.ARRAY_OBJ) {
    return new object.Error(`argument to \`push\` must be ARRAY, got ${args[0].type}`)
  }
  const arr = args[0] as object.Array
  const newElements = [...arr.elements, args[1]]
  return new object.Array(newElements)
})

const builtins = new Map<string, object.Builtin>([
  ['len', len],
  ['first', first],
  ['last', last],
  ['rest', rest],
  ['push', push],
])

export default builtins