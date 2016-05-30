// Diff can only be required and not imported
const diff = require('diff')
const bunyan = require('bunyan')

const replaceTypos = require('./replaceTypos')
const getTypoMaps = require('./getTypoMaps')
const isHumanReadable = require('./helpers/isHumanReadable')

const log = bunyan.createLogger({
  name: 'get-diff',
  level: 0,
})

const notHumanReadableError = new Error('Not human readable')


module.exports = (options = {}) => {
  const {entry} = options
  const filePath = entry.path()

  return entry
    .getBlob()
    .then(blob => blob.toString())
    .then(fileContent => {
      let newFileContent = fileContent
      let contentWasChanged = false

      if (!isHumanReadable(filePath, fileContent)) {
        log.debug(`${filePath} is not human readable`)
        throw notHumanReadableError
      }

      return getTypoMaps.then(typoMapObjects => {
        typoMapObjects.forEach(typoMapObject => {

          log.trace(
            'Check if %s is a %s file: %s',
            filePath,
            typoMapObject.name,
            typoMapObject.test(filePath)
          )

          if (!typoMapObject.test(filePath)) {
            return
          }

          const changedFileContent = replaceTypos(
            newFileContent,
            filePath,
            typoMapObject.map
          )
          if (changedFileContent) {
            contentWasChanged = true
            newFileContent = changedFileContent
          }
        })

        if (!contentWasChanged) {
          log.debug('Nothing was fixed in %s', filePath)
        }
        else {
          return diff.createPatch(
            filePath,
            fileContent,
            newFileContent
          )
        }
      })
    })
    .then(diffText => {
      if (diffText) {
        log.debug({filePath, diffText})
        return diffText
      }
    })
    .catch(error => {
      if (error === notHumanReadableError) return
      log.error(error)
    })
}
