const typokit = require('typokit')
const getTypoFixFunction = require('./getTypoFixFunction')

function* generatorFunction (typoMap) {
  for (const typo in typoMap) {
    if (!typoMap.hasOwnProperty(typo)) continue

    const correction = typoMap[typo]
    yield {
      name: `fix-typo-${typo}`,
      description: `This function corrects the typo "${typo
        }" to "${correction}"`,
      signature: {
        type: 'string',
        description: `A text containing the typo "${typo}"`,
      },
      function: getTypoFixFunction({typo, correction}),
    }
  }
}

module.exports = () => typokit
  .typoToWordPromise
  .then(generatorFunction)
