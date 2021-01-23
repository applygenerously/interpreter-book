let traceLevel = 0

const traceIdentPlaceholder = '\t'

function identLevel() {
  return traceIdentPlaceholder.repeat(traceLevel - 1)
}

function tracePrint(s: string) {
  console.log(`${identLevel()}${s}\n`)
}

function incIdent() {
  traceLevel++
}

function decIdent() {
  traceLevel --
}

function trace(msg: string) {
  incIdent()
  tracePrint(`BEGIN ${msg}`)
  return msg
}

function untrace(msg: string) {
  tracePrint(`END ${msg}`)
  decIdent()
}

export {
  trace,
  untrace,
}