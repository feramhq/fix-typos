const wordCase = require('case')

module.exports = (options = {}) => {
  const {typo, correction, log} = options
  const pattern = `(\\W)(${typo})(\\W)`
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


  return (fileContent) => {
    if (!localTypoRegex.test(fileContent)) return false

    return fileContent.replace(globalTypoRegex, replacer)
  }
}
