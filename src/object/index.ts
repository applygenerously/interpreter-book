enum ObjectType {
  INTEGER_OBJ = 'INTEGER',
  BOOLEAN_OBJ = 'BOOLEAN',
  NULL_OBJ = 'NULL',
  RETURN_VALUE_OBJ = 'RETURN_VALUE_OBJ',
}

class Integer {
  type = ObjectType.INTEGER_OBJ
  value: number

  constructor(value: number) {
    this.value = value
  }

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

type Object = Integer | Boolean | Null | ReturnValue

class ReturnValue {
  type = ObjectType.RETURN_VALUE_OBJ
  value: Object

  constructor(value: Object) {
    this.value = value
  }

  inspect() {
    return this.value.inspect()
  }
}


export {
  Integer,
  Boolean,
  Null,
  Object,
  ObjectType,
  ReturnValue,
}