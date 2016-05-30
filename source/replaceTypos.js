const bunyan = require('bunyan')
const Case = require('case')

const log = bunyan.createLogger({
  name: 'fix-typo',
  level: 0,
})

module.exports = (fileContent, filePath, typoMap) => {
  let isChanged = false

  for (const typo in typoMap) {
    if (typoMap.hasOwnProperty(typo)) {
      const typoRegex = new RegExp(`(\\W)${typo}(\\W)`, 'gi')

      if (!typoRegex.test(fileContent)) {
        continue
      }

      isChanged = true

      fileContent = fileContent.replace(
        typoRegex,
        (match, p1, p2) => {
          const replacement = p1 + Case[Case.of(match)](typoMap[typo]) + p2

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

  return isChanged ? fileContent : null
}
