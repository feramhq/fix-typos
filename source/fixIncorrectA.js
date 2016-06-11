const assert = require('assert')
const bunyan = require('bunyan')
const log = bunyan.createLogger({
  name: 'fix incorrect a',
  level: 0,
})

module.exports = (fileContent) => {
  assert(
    typeof fileContent === 'string',
    `Argument must be of type "string" and not "${typeof fileContent}"`
  )

  const start = /((?:[ .?!,;\n\t]|^)[aA])/.source
  const incorrectA = new RegExp(
    start +
    / ((?:[aei]|o(?!nc|ne)|u(?!ni|se|ti)|ho(?:ur|n)))/.source,
    'g'
  )

  const fixedFileContent = fileContent.replace(
    incorrectA,
    (match, article, word, offset, string) => {
      const replacement = `${article}n ${word}`
      const endOfMatch = offset + match.length
      const sentenceFragment = string.slice(
        endOfMatch,
        Math.min(
          string.indexOf(' ', endOfMatch),
          string.indexOf('\n', endOfMatch)
        ) || Infinity
      )
      log.trace(`"${(match + sentenceFragment).trim()}" -> "${
        (replacement + sentenceFragment).trim()}"`)
      return replacement
    }
  )

  return fixedFileContent !== fileContent ?
    fixedFileContent :
    false
}
