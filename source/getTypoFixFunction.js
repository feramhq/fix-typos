const wordCase = require('case')
const bunyan = require('bunyan')
const log = bunyan.createLogger({
  name: 'fix typo',
  level: 0,
})

module.exports = ({typo, correction} = {}) => (fileContent) => {
  const typoRegex = new RegExp(`(\\W)(${typo})(\\W)`, 'gi')

  if (!typoRegex.test(fileContent)) return false

  const fixedFileContent = fileContent.replace(
    typoRegex,
    (match, p1, p2, p3) => {
      const replacement = p1 + wordCase[wordCase.of(p2)](correction) + p3

      log.trace(
        '%s -> %s in %s',
        JSON.stringify(match),
        JSON.stringify(replacement)
      )

      return replacement
    }
  )

  return fixedFileContent
}
