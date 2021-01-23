import { lookupIdent, Token, TokenType } from '../token'

type Char = string | 0

export default class Lexer {
  /**
   * Source code input
   */
  readonly input: string
  /**
   * Current position in input (points to current char)
   */
  private position: number = 0
  /**
   * Current reading position in input (after current char)
   */
  private readPosition: number = 0
  /**
   * Char under examination
   */
  private ch: Char = ''


  constructor(input: string) {
    this.input = input
    this.readChar()
  }

  /**
   * Gives us the next character and advances our position in the input string
   */
  readChar() {
    // if we are at end of input, set ch to 0, signifying end of input
    if (this.readPosition >= this.input.length) {
      this.ch = 0
    } else {
      this.ch = this.input[this.readPosition]
    }
    this.position = this.readPosition
    this.readPosition += 1
  }

  /**
   * Look ahead in input by one char, but
   * do not increment position or readPosition
   */
  peekChar() {
    if (this.readPosition >= this.input.length) {
      return 0
    } else {
      return this.input[this.readPosition]
    }
  }

  readIdentifier() {
    const start = this.position
    while (isLetter(this.ch) && this.readPosition <= this.input.length) {
      this.readChar()
    }
    return this.input.slice(start, this.position)
  }

  readNumber() {
    const start = this.position
    while (isDigit(this.ch) && this.readPosition <= this.input.length) {
      this.readChar()
    }
    return this.input.slice(start, this.position)
  }

  skipWhitespace() {
    while (/\s/.test(this.ch as string)) {
      this.readChar()
    }
  }

  nextToken() {
    let tok

    this.skipWhitespace()

    switch(this.ch) {
      case '=':
        if (this.peekChar() === '=') {
          const ch = this.ch
          this.readChar()
          const literal = ch.concat(this.ch)
          tok = new Token(TokenType.EQ, literal)
        } else {
          tok = new Token(TokenType.ASSIGN, this.ch)
        }
        break
      case '+':
        tok = new Token(TokenType.PLUS, this.ch)
        break
      case '-':
        tok = new Token(TokenType.MINUS, this.ch)
        break
      case '!':
        if (this.peekChar() === '=') {
          const ch = this.ch
          this.readChar()
          const literal = ch.concat(this.ch)
          tok = new Token(TokenType.NOTEQ, literal)
        } else {
          tok = new Token(TokenType.BANG, this.ch)
        }
        break
      case '*':
        tok = new Token(TokenType.ASTERISK, this.ch)
        break
      case '/':
        tok = new Token(TokenType.SLASH, this.ch)
        break
      case '<':
        tok = new Token(TokenType.LT, this.ch)
        break
      case '>':
        tok = new Token(TokenType.GT, this.ch)
        break
      case ';':
        tok = new Token(TokenType.SEMICOLON, this.ch)
        break
      case '(':
        tok = new Token(TokenType.LPAREN, this.ch)
        break
      case ')':
        tok = new Token(TokenType.RPAREN, this.ch)
        break
      case ',':
        tok = new Token(TokenType.COMMA, this.ch)
        break
      case '{':
        tok = new Token(TokenType.LBRACE, this.ch)
        break
      case '}':
        tok = new Token(TokenType.RBRACE, this.ch)
        break
      case 0:
        tok = new Token(TokenType.EOF, '')
        break
      default:
        if (isLetter(this.ch)) {
          const literal = this.readIdentifier()
          const type = lookupIdent(literal)
          tok = new Token(type, literal)
          return tok
        } else if (isDigit(this.ch)) {
          const literal = this.readNumber()
          tok = new Token(TokenType.INT, literal)
          return tok
        } else {
          tok = new Token(TokenType.ILLEGAL, this.ch)
        }
    }
    
    this.readChar()
    return tok
  }
}

function isLetter(ch: Char) {
  return /[a-zA-Z]/.test(ch as string)
}

function isDigit(ch: Char) {
  return /\d/.test(ch as string)
}