import * as object from '../object'

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
})

const last = new object.Builtin((...args: object.Object[]) => { })

const rest = new object.Builtin((...args: object.Object[]) => { })

const push = new object.Builtin((...args: object.Object[]) => { })

const builtins = new Map<string, object.Builtin>([
  ['len', len],
  ['first', first],
  ['last', last],
  ['rest', rest],
  ['push', push],
])

export default builtins