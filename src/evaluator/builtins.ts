import * as object from '../object'

const len = new object.Builtin((...args: object.Object[]) => {
  if (args.length !== 1) {
    return new object.Error(`wrong number of arguments. got=${args.length}, want=1`)
  }
  const arg = args[0]
  switch (arg.type) {
    case object.ObjectType.STRING_OBJ:
      return new object.Integer((arg as object.String).value.length)
    default:
      return new object.Error(`argument to \`len\` not supported, got ${arg.type}`)
  }
})

const builtins = new Map<string, object.Builtin>([
  ['len', len],
])

export default builtins