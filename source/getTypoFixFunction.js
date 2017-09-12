const wordCase = require('case')
const buildPatch =  require('../source/buildPatch.js')

module.exports = (options = {}) => {
  const {
    typo,
    correction,
    log,
    maximumLineLength = 1000,
  } = options
  const pattern = `(^|\\W)(${typo})(\\W|$)`
  const localTypoRegex = new RegExp(pattern, 'i')
  const globalTypoRegex = new RegExp(pattern, 'gi')
  const correctionIncludesDash = correction.includes('-')


  function replacer (match, p1, p2, p3) {
    const fixedTypo = wordCase[wordCase.of(p2)](correction)
    const replacementString = p1 +
      (correctionIncludesDash
        ? fixedTypo.replace(/ /g, '-')
        : fixedTypo) +
      p3

    log.trace(
      '%s -> %s',
      JSON.stringify(match),
      JSON.stringify(replacementString)
    )

    return replacementString
  }


  return (args = {}) => {
    const {text: fileContent, fileName} = args
    if (!localTypoRegex.test(fileContent)) return false

    const patches = []
    const lines = fileContent.split('\n')

    lines.forEach((lineContent, lineIndex) => {
      const lineNumber = lineIndex + 1
      if (lineContent.length < maximumLineLength) {
        if (localTypoRegex.test(lineContent)) {
          patches.push({
            type: 'unidiff',
            fileName,
            body: buildPatch(
              fileName,
              lineNumber,
              lineContent,
              lineContent.replace(globalTypoRegex, replacer)
            ),
            containsFix: true,
          })
        }
      }
    })

    return patches.length
      ? patches
      : null
  }
}
