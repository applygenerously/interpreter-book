import * as ast from '../ast'

enum ObjectType {
  INTEGER_OBJ = 'INTEGER',
  BOOLEAN_OBJ = 'BOOLEAN',
  NULL_OBJ = 'NULL',
  RETURN_VALUE_OBJ = 'RETURN_VALUE_OBJ',
  ERROR_OBJ = 'ERROR_OBJ',
  FUNCTION_OBJ = 'FUNCTION_OBJ',
  STRING_OBJ = 'STRING',
  BUILTIN_OBJ = 'BUILTIN',
  ARRAY_OBJ = 'ARRAY',
}

class Integer {
  type = ObjectType.INTEGER_OBJ
  value: number

  constructor(value: number) {
    this.value = value
  }

  // @ts-ignore
  inspect() {
    return this.value
  }
}

class Boolean {
  type = ObjectType.BOOLEAN_OBJ
  value: boolean

  constructor(value: boolean) {
    this.value = value
  }

  inspect() {
    return this.value
  }
}

class Null {
  type = ObjectType.NULL_OBJ

  inspect() {
    return 'null'
  }
}

class ReturnValue {
  type = ObjectType.RETURN_VALUE_OBJ
  value: Object
  
  constructor(value: Object) {
    this.value = value
  }
  
  // @ts-ignore
  inspect() {
    return this.value.inspect()
  }
}

class Error {
  type = ObjectType.ERROR_OBJ
  message: string

  constructor(message: string) {
    this.message = message
  }

  inspect() {
    return `ERROR: ${this.message}`
  }
}

class Environment {
  store: Map<string, Object> = new Map()
  outer: Environment | null = null

  // @ts-ignore
  get(name: string) {
    let obj = this.store.get(name)
    if (!obj && this.outer !== null) {
      obj = this.outer.get(name)
    }
    return obj
  }

  set(name: string, val: Object) {
    this.store.set(name, val)
    return val
  }

  // @ts-ignore
  has(name: string) {
    return this.store.has(name) || this.outer && this.outer.has(name)
  }
}

function newEnclosedEnvironment(outer: Environment) {
  const env = new Environment()
  env.outer = outer
  return env
}

class Function {
  type = ObjectType.FUNCTION_OBJ
  parameters: ast.Identifier[]
  body: ast.BlockStatement
  env: Environment

  constructor(parameters: ast.Identifier[], body: ast.BlockStatement, env: Environment) {
    this.parameters = parameters
    this.body = body
    this.env = env
  }

  //  @ts-ignore
  inspect() {
    return `fn(${this.parameters.join(', ')}) {\n${this.body.string()}\n}`
  }
}

class String {
  type = ObjectType.STRING_OBJ
  value: string

  constructor(value: string) {
    this.value = value
  }

  // @ts-ignore
  inspect() {
    return this.value
  }
}

type BuiltinFunction = (...args: Object[]) => Object

class Builtin {
  type = ObjectType.BUILTIN_OBJ
  fn: BuiltinFunction

  constructor(fn: BuiltinFunction) {
    this.fn = fn
  }

  inspect() {
    return 'builtin function'
  }
}

class Array {
  type = ObjectType.ARRAY_OBJ
  elements: Object[] = []

  constructor(elements: Object[]) {
    this.elements = elements
  }

  // @ts-ignore
  inspect() {
    return `[${this.elements.map(e => e.inspect()).join(', ')}]`
  }
}

type Object =
  | Integer
  | Boolean
  | Null
  | Error
  | ReturnValue
  | Function
  | String
  | Builtin
  | Array

export {
  Integer,
  Boolean,
  Null,
  Object,
  ObjectType,
  ReturnValue,
  Error,
  Environment,
  Function,
  String,
  Builtin,
  Array,
  newEnclosedEnvironment,
}