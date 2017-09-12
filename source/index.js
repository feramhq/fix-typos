const typokit = require('typokit')
const getTypoFixFunction = require('./getTypoFixFunction')
const bunyan = require('bunyan')
const defaultLog = bunyan.createLogger({
  name: 'fix typo',
  level: 0,
})
let log

function* generatorFunction (typoMap) {
  for (const typo in typoMap) {
    if (!typoMap.hasOwnProperty(typo)) continue

    const correction = typoMap[typo]
    yield {
      name: `fix-typo-${typo}`,
      description:
        `This function corrects the typo "${typo}" to "${correction}"`,
      signature: {
        type: 'object',
        properties: {
          text: {type: 'string'},
          filePath: {type: 'string'},
          repoPath: {type: 'string'},
        },
        returnType: 'patchObjects',
      },
      function: getTypoFixFunction({typo, correction, log}),
    }
  }
}

module.exports = (options = {}) => {
  const {log: currentLog} = options

  if (currentLog) log = currentLog.child({fixFunction: 'fix-typo-'})
  else log = defaultLog

  return typokit
    .typoToWordPromise
    .then(generatorFunction)
}
