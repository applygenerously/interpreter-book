enum ObjectType {
  INTEGER_OBJ = 'INTEGER',
  BOOLEAN_OBJ = 'BOOLEAN',
  NULL_OBJ = 'NULL'
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

type Object = Integer | Boolean | Null

export {
  Integer,
  Boolean,
  Null,
  Object,
  ObjectType,
}