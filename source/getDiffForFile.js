// Diff can only be required and not imported
const diff = require('diff')
const bunyan = require('bunyan')
const log = bunyan.createLogger({
  name: 'get diff for file',
  level: 0,
})

const replaceTypos = require('./replaceTypos')
const typoMapsPromise = require('./typoMapsPromise')
const isHumanReadable = require('./helpers/isHumanReadable')
const fixIncorrectA = require('./fixIncorrectA')
const fixIncorrectAn = require('./fixIncorrectAn')

class NotHumanReadableError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NotHumanReadableError'
    this.message = message
  }
}

class NothingChangedError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NothingChangedError'
    this.message = message
  }
}


module.exports = (options = {}) => {
  const {entry, falsePositiveMaximum = 1} = options
  const filePath = entry.path()

  function fixTypos (typoMapObjects, fileContent, newFileContent) {
    let contentWasChanged = false

    typoMapObjects.forEach(typoMapObject => {
      log.trace(
        'Check if %s is a %s file: %s',
        filePath,
        typoMapObject.name,
        typoMapObject.test(filePath)
      )

      if (!typoMapObject.test(filePath)) return

      const changedFileContent = replaceTypos({
        fileContent: newFileContent,
        filePath,
        typoMap: typoMapObject.map,
        falsePositiveMaximum,
      })

      if (changedFileContent) {
        contentWasChanged = true
        newFileContent = changedFileContent
      }
    })

    if (!contentWasChanged) return false

    return diff.createPatch(
      filePath,
      fileContent,
      newFileContent
    )
  }

  return entry
    .getBlob()
    .then(blob => blob.toString())
    .then(fileContent => {
      if (!isHumanReadable(filePath, fileContent)) {
        log.debug(`Not human readable: ${filePath}`)
        throw new NotHumanReadableError(filePath)
      }

      const falsePositiveValue = 0.5 // for fixIndefiniteArticle
      let promiseChain = Promise.resolve(fileContent)

      if (falsePositiveValue < falsePositiveMaximum) {
        const fixedContent = fixIncorrectA(fileContent)
        const fixedTwice = fixIncorrectAn(fixedContent || fileContent)

        promiseChain = promiseChain.then(() => fixedTwice || fileContent)
      }

      return promiseChain
        .then(fixedContent => {
          return typoMapsPromise.then(typoMapObjects =>
            fixTypos(typoMapObjects, fileContent, fixedContent)
          )
        })
        .then(diffText => {
          log.debug({filePath, diffText})
          return diffText
        })
    })
    .catch(error => {
      if (error instanceof NotHumanReadableError) return
      if (error instanceof NothingChangedError) {
        return
      }
      log.error(error)
    })
}
