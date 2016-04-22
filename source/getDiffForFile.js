// Diff can only be required and not imported
const diff = require('diff')
import bunyan from 'bunyan'

import replaceTypos from './replaceTypos'
import typoMapObjects from './typoMaps'
import isHumanReadable from './helpers/isHumanReadable'

const log = bunyan.createLogger({
	name: 'get-diff',
	level: 0,
})


export default (options = {}) => {
	const {entry, repo} = options
	const filePath = entry.path()

	return entry
		.getBlob()
		.then(blob => blob.toString())
		.then(fileContent => {
			let newFileContent = fileContent
			let contentWasChanged = false

			if  (!isHumanReadable(filePath, fileContent)) {
				throw new Error('not human readable')
			}

			typoMapObjects.forEach(typoMapObject => {

				log.trace(
					'Check if %s is a %s file: %s',
					filePath,
					typoMapObject.name,
					typoMapObject.test(filePath),
				)

				if (!typoMapObject.test(filePath)) {
					return
				}

				const changedFileContent = replaceTypos(
					newFileContent,
					filePath,
					typoMapObject.map,
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
					newFileContent,
				)
			}
		})
		.then(diff => {
			if (diff) {
				log.debug({filePath, diff})
				return diff
			}
		})
		.catch(error => log.error(error))
}
