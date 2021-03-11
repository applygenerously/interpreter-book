import { TokenType, Token } from '../token'
import Lexer from './'

describe('lexer', () => {
  test('lexes input into tokens', () => {
    const input = 
    `
    let five = 5;
    
    let ten = 10;

    let add = fn(x, y) {
      x + y;
    };

    let result = add(five, ten);
    
    !-/*5;
    5 < 10 > 5;
    
    if (5 < 10) {
      return true;
    } else {
      return false; 
    }
    
    10 == 10
    10 != 9
    
    "foobar"
    "foo bar"

    [1, 2];
    `

    const expected = [
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'five' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'ten' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.INT, literal: '10' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'add' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.FUNCTION, literal: 'fn' },
      { type: TokenType.LPAREN, literal: '(' },
      { type: TokenType.IDENT, literal: 'x' },
      { type: TokenType.COMMA, literal: ',' },
      { type: TokenType.IDENT, literal: 'y' },
      { type: TokenType.RPAREN, literal: ')' },
      { type: TokenType.LBRACE, literal: '{' },
      { type: TokenType.IDENT, literal: 'x' },
      { type: TokenType.PLUS, literal: '+' },
      { type: TokenType.IDENT, literal: 'y' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.RBRACE, literal: '}' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'result' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.IDENT, literal: 'add' },
      { type: TokenType.LPAREN, literal: '(' },
      { type: TokenType.IDENT, literal: 'five' },
      { type: TokenType.COMMA, literal: ',' },
      { type: TokenType.IDENT, literal: 'ten' },
      { type: TokenType.RPAREN, literal: ')' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.BANG, literal: '!' },
      { type: TokenType.MINUS, literal: '-' },
      { type: TokenType.SLASH, literal: '/' },
      { type: TokenType.ASTERISK, literal: '*' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.LT, literal: '<' },
      { type: TokenType.INT, literal: '10' },
      { type: TokenType.GT, literal: '>' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.SEMICOLON, literal: ';' },
      new Token(TokenType.IF, 'if'),
      new Token(TokenType.LPAREN, '('),
      new Token(TokenType.INT, '5'),
      new Token(TokenType.LT, '<'),
      new Token(TokenType.INT, '10'),
      new Token(TokenType.RPAREN, ')'),
      new Token(TokenType.LBRACE, '{'),
      new Token(TokenType.RETURN, 'return'),
      new Token(TokenType.TRUE, 'true'),
      new Token(TokenType.SEMICOLON, ';'),
      new Token(TokenType.RBRACE, '}'),
      new Token(TokenType.ELSE, 'else'),
      new Token(TokenType.LBRACE, '{'),
      new Token(TokenType.RETURN, 'return'),
      new Token(TokenType.FALSE, 'false'),
      new Token(TokenType.SEMICOLON, ';'),
      new Token(TokenType.RBRACE, '}'),
      new Token(TokenType.INT, '10'),
      new Token(TokenType.EQ, '=='),
      new Token(TokenType.INT, '10'),
      new Token(TokenType.INT, '10'),
      new Token(TokenType.NOTEQ, '!='),
      new Token(TokenType.INT, '9'),
      new Token(TokenType.STRING, 'foobar'),
      new Token(TokenType.STRING, 'foo bar'),
      new Token(TokenType.LBRACKET, '['),
      new Token(TokenType.INT, '1'),
      new Token(TokenType.COMMA, ','),
      new Token(TokenType.INT, '2'),
      new Token(TokenType.RBRACKET, ']'),
      new Token(TokenType.SEMICOLON, ';'),
      { type: TokenType.EOF, literal: '' },
    ]

    const l = new Lexer(input)

    for (const e of expected) {
      let tok = l.nextToken()
      expect(tok).toEqual(e)
    }
  })
})