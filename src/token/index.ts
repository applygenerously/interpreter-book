enum TokenType {
  // Token type we don't recognize
  ILLEGAL = 'ILLEGAL',
  // End of file
  EOF = 'EOF',

  // Indentifiers and literals
  IDENT = 'IDENT', // variable names
  INT = 'INT', // 1, 2, 3...
  STRING = 'STRING',

  // Operators
  ASSIGN = '=',
  PLUS = '+',
  MINUS = '-',
  BANG = '!',
  ASTERISK = '*',
  SLASH = '/',
  LT = '<',
  GT = '>',
  EQ = '==',
  NOTEQ = '!=',

  // Delimiters
  COMMA = ',',
  SEMICOLON = ';',
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',

  // Keywords
  FUNCTION = 'FUNCTION',
  LET = 'LET',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
}

const keywords = new Map<string, TokenType>([
  ['fn', TokenType.FUNCTION],
  ['let', TokenType.LET],
  ['true', TokenType.TRUE],
  ['false', TokenType.FALSE],
  ['if', TokenType.IF],
  ['else', TokenType.ELSE],
  ['return', TokenType.RETURN],
])

function lookupIdent(ident: string): TokenType {
  if (keywords.has(ident)) {
    return keywords.get(ident)!
  }
  return TokenType.IDENT
}

export default class Token {
  type: TokenType
  literal: string 
  
  constructor(type: TokenType, literal: string) {
    this.type = type
    this.literal = literal
  }
}

interface LetStatementToken extends Token {
  type: TokenType.LET;
  literal: string;
}

interface ReturnStatementToken extends Token {
  type: TokenType.RETURN;
  literal: string;
}

export {
  lookupIdent,
  TokenType,
  Token,
  LetStatementToken,
  ReturnStatementToken,
}
