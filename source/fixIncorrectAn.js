const assert = require('assert')
const bunyan = require('bunyan')
const log = bunyan.createLogger({
  name: 'fix incorrect an',
  level: 0,
})

module.exports = (fileContent) => {
  assert(
    typeof fileContent === 'string',
    `Argument must be of type "string" and not "${typeof fileContent}"`
  )

  const start = /((?:[ .?!,;\n\t]|^)[aA])/.source
  const incorrectAn = new RegExp(
    start +
    /n ([bcdfgj-np-tv-z]|h(?!o[nu][^s])|u(?:s|ni))/.source,
    'g'
  )

  const fixedFileContent = fileContent.replace(
    incorrectAn,
    (match, article, word, offset, string) => {
      const replacement = `${article} ${word}`
      const endOfMatch = offset + match.length
      const sentenceFragment = string.slice(
        endOfMatch,
        string.indexOf('\n', endOfMatch) + 1 || Infinity
      )
      log.trace(`"${(match + sentenceFragment).trim()}" -> "${
        (replacement + sentenceFragment).trim()}"`.trim())
      return replacement
    }
  )

  return fixedFileContent !== fileContent ?
    fixedFileContent :
    false
}
