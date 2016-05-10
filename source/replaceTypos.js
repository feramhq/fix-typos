import bunyan from 'bunyan'

const log = bunyan.createLogger({
  name: 'fix-typo',
  level: 0,
})

function isLowerCase (string) {
  return string === string.toLowerCase() &&
    string !== string.toUpperCase()
}

export default (fileContent, filePath, typoMap) => {
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
          const replacement = p1 +
            (isLowerCase(match[1]) ?
              typoMap[typo] :
              typoMap[typo]
                .slice(0, 1)
                .toUpperCase() + typoMap[typo].slice(1)
            ) +
            p2

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
