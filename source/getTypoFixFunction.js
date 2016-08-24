const wordCase = require('case')

module.exports = (options = {}) => (fileContent) => {
  const {typo, correction, log} = options
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
