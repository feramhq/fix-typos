const Case = require('case')
const bunyan = require('bunyan')
const log = bunyan.createLogger({
  name: 'fix typo',
  level: 0,
})

module.exports = (options = {}) => {
  const {fileContent, filePath, typoMap, falsePositiveMaximum} = options

  let isChanged = false
  let fixedFileContent

  for (const typo in typoMap) {
    if (typoMap.hasOwnProperty(typo)) {

      // Words with more characters are unlikely to produce false positives
      const minimumNumberOfCharacters = 7
      const falsePositiveValue = 1 - (typo.length / minimumNumberOfCharacters)

      if (falsePositiveValue > falsePositiveMaximum) continue

      const typoRegex = new RegExp(`(\\W)(${typo})(\\W)`, 'gi')

      if (!typoRegex.test(fileContent)) continue

      isChanged = true

      fixedFileContent = fileContent.replace(
        typoRegex,
        (match, p1, p2, p3) => {
          const replacement = p1 + Case[Case.of(p2)](typoMap[typo]) + p3

          log.trace(
            '%s -> %s in %s',
            JSON.stringify(match),
            JSON.stringify(replacement),
            filePath
          )

          return replacement
        }
      )
    }
  }

  return isChanged ? fixedFileContent : null
}
